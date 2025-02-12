// routes/documentRoutes.ts

import { chatDB, documentDBHelpers } from '@/backend/db';
import { documentChatResponseSchema } from '@/backend/model';
import { createChatModel, formatChatContext, initializeChat, saveMessages } from '@/backend/utils/chat';
import * as lancedb from '@lancedb/lancedb';
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Elysia, t } from 'elysia';
import { existsSync } from 'fs';
import { unlink } from 'fs/promises';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { v4 as uuidv4 } from 'uuid';
import { CONFIG } from '../../config';
import { writeFile } from 'fs/promises';


// Initialize directories
// for (const dir of [VECTOR_DB_PATH, UPLOAD_DIR]) {
//     if (!existsSync(dir)) {
//         await mkdir(dir, { recursive: true });
//     }
// }

const embeddings = (apiKey: string) => new OpenAIEmbeddings({
    apiKey,
    batchSize: 512,
    model: "text-embedding-3-small",
    dimensions: 1536,
});

const TEXT_SPLITTER = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
    lengthFunction: (text: string) => text.length,
    separators: ["\n\n", "\n", " ", ""],
});

// Initialize LanceDB connection
let db: Awaited<ReturnType<typeof lancedb.connect>>;

const initDB = async () => {
    db = await lancedb.connect(CONFIG.VECTOR_DB_PATH);
};
await initDB();

export const documentRoutesV1 = new Elysia({ prefix: '/v1/documents' })
    .get('', async () => {
        return await documentDBHelpers.getAllDocuments();
    })

    .post('/upload', async ({ body, request: { headers } }) => {
        console.log("/document/upload");
        if (!body.file) {
            throw new Error('No file provided');
        }

        const file = body.file;
        if (!file.name.toLowerCase().endsWith('.pdf')) {
            throw new Error('Only PDF files are supported');
        }

        const fileBuffer = await file.arrayBuffer();
        const docId = uuidv4();
        const filePath = `${CONFIG.UPLOAD_PATH}/${docId}.pdf`
        console.log(filePath);


        // Create document record
        const document = {
            id: docId,
            filename: file.name,
            status: 'processing',
            chunks: 0,
            createdAt: new Date().toISOString()
        };

        await documentDBHelpers.updateDocument(docId, document);

        try {
            // Save file temporarily

            await writeFile(filePath, Buffer.from(fileBuffer));

            // Process document
            const loader = new PDFLoader(filePath);
            const rawDocs = await loader.load();
            const splitDocs = await TEXT_SPLITTER.splitDocuments(rawDocs);
            const chunks = splitDocs.map(doc => doc.pageContent.trim());

            // Get embeddings
            const vectors = await embeddings(headers.get('apiKey') as string).embedDocuments(chunks);

            // Create document chunks with vectors
            const documentChunks = chunks.map((content, index) => ({
                id: uuidv4(),
                docId,
                chunkIndex: index,
                content,
                vector: vectors[index],
            }));

            // Store in vector database
            const table = await db.createTable(docId, documentChunks, {
                mode: 'overwrite'
            });

            // Update document status
            await documentDBHelpers.updateDocument(docId, {
                ...document,
                status: 'complete',
                chunks: chunks.length
            });

            return {
                id: docId,
                status: 'complete',
                chunks: chunks.length,
                textPreview: chunks[0].slice(0, 500) + '...',
            };

        } catch (error: any) {
            console.log(JSON.stringify(error.message));
            // Update document status on failure
            await documentDBHelpers.updateDocument(docId, {
                ...document,
                status: 'failed',
                error: error.message
            });
            throw new Error(`Processing failed: ${error.message}`);
        }
    }, {
        body: t.Object({
            file: t.File()
        }),
        headers: t.Optional(t.Object({ apiKey: t.String() })),
        response: t.Object({
            id: t.String(),
            status: t.String(),
            chunks: t.Number(),
            textPreview: t.String()
        })
    })

    .get('/:document_id', async ({ params }) => {
        const document = await documentDBHelpers.getDocument(params.document_id);
        if (!document) {
            throw new Error('Document not found');
        }
        return document;
    })

    .post('/:document_id/chat', async ({ params, body, query, request: { headers } }) => {
        const { document_id } = params;
        const {
            question,
            num_context = 3,
            model = 'gpt-4o-mini',
            provider
        } = body;
        let { conversationId = `session-${Date.now()}` } = query;


        // Validate document
        const document = await documentDBHelpers.getDocument(document_id);
        if (!document) {
            throw new Error('Document not found');
        }
        if (document.status !== 'complete') {
            throw new Error('Document not processed successfully');
        }

        // Get query embedding and search for relevant chunks
        const queryVector = await embeddings(headers.get('apiKey') as string).embedQuery(question);
        const table = await db.openTable(document_id);
        const relevantChunks = await table.vectorSearch(queryVector)
            .limit(num_context)
            .toArray();

        // Prepare system prompt with context
        const systemPrompt = `Answer questions based on this context:\n${relevantChunks.map((c: any) => c.content).join('\n\n')
            }\n\nIf unsure, say you don't know.`;

        // Get response from chat model
        const chatModel = createChatModel(model, provider, headers.get('apiKey') as string);
        const { title, history } = await initializeChat(conversationId, question, chatModel);
        const messages = formatChatContext(systemPrompt, history, question);
        const response = await chatModel.invoke(messages);

        // Save messages to chat history
        await saveMessages(conversationId, question, response.content as string);

        return {
            status: "success",
            data: {
                response: response.content as string,
                conversation_id: conversationId,
                title,
                contextSources: relevantChunks.map((chunk: any) => ({
                    content: chunk.content
                }))
            }
        };
    }, {
        params: t.Object({ document_id: t.String() }),
        query: t.Object({
            conversationId: t.Optional(t.String())
        }),
        headers: t.Optional(t.Object({ apiKey: t.String() })),
        body: t.Object({ question: t.String(), num_context: t.Optional(t.Number()), provider: t.String(), model: t.String() }),
        response: documentChatResponseSchema
    })

    .get('/:document_id/conversations', async ({ params }) => {
        const { document_id } = params;

        try {
            const allChats = await chatDB.getData('/chats');

            // Filter conversations for this document
            const documentChats = Object.entries(allChats)
                .filter(([id]) => id.startsWith(`doc-${document_id}`))
                .map(([id, chat]: [string, any]) => ({
                    conversation_id: id,
                    title: chat.title,
                    messages: chat.messages
                }));

            return documentChats;
        } catch (error) {
            return [];
        }
    })

    .post('/:document_id/query', async ({ params, body, request: { headers } }) => {
        const { document_id } = params;
        const { query, num_results = 5 } = body;

        // Validate document
        const document = await documentDBHelpers.getDocument(document_id);
        if (!document) {
            throw new Error('Document not found');
        }
        if (document.status !== 'complete') {
            throw new Error('Document not processed successfully');
        }

        // Perform vector search
        const queryVector = await embeddings(headers.get('apiKey') as string).embedQuery(query);
        const table = await db.openTable(document_id);
        const results = await table.vectorSearch(queryVector)
            .limit(num_results)
            .toArray();

        return {
            results: results.map((result: any) => ({
                content: result.content
            }))
        };
    }, {
        params: t.Object({ document_id: t.String() }),
        body: t.Object({ query: t.String(), num_results: t.Optional(t.Number()) }),
        headers: t.Optional(t.Object({ apiKey: t.String() })),
        response: t.Object({
            "results": t.Array(t.Object({
                "content": t.String()
            }))
        })
    });