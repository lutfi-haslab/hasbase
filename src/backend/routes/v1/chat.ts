import { chatMessageSchema, ChatResponse, chatResponseSchema, chatSessionSchema } from "@/backend/model";
import { createChatModel, getChatHistory, initializeChat, saveMessages } from "@/backend/utils/chat";
import Elysia, { t } from "elysia";
import { CONFIG } from "../../config";
import { chatDB } from "../../db";


export const chatRoutesV1 = new Elysia({ prefix: '/v1/chat' })
    .get('/history', async ({ query }) => {
        const { conversationId } = query;
        if (!conversationId) {
            throw new Error('No conversation ID provided');
        }
        return await getChatHistory(conversationId);
    }, {
        query: t.Object({
            conversationId: t.String()
        }),
        response: t.Array(chatMessageSchema)
    })

    .get('/conversations', async () => {
        try {
            const chatData = await chatDB.getData('/chats');
            if (!chatData) return [];

            return Object.entries(chatData)
                .map(([sessionId, session]: [string, any]) => ({
                    session_id: sessionId,
                    title: session.title,
                    messages: session.messages,
                    timestamp: session.timestamp
                }))
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        } catch (error) {
            console.error("Error fetching chat data:", error);
            return [];
        }
    }, {
        response: t.Array(chatSessionSchema)
    })

    .post('/stream', async function* ({ query, body, request: { headers }, set }) {
        console.log("Streaming chat");
        const { message, model = CONFIG.DEFAULT_MODEL, provider } = body;

        set.headers['Content-Type'] = 'text/event-stream';

        try {
            const chatModel = createChatModel(model, provider, headers.get('apiKey') as string, true);
            const { title, history, conversationId } = await initializeChat(query.conversationId, message, chatModel); // Get conversationId from initializeChat

            console.log("Conversation ID in /stream:", conversationId); // Log the ID

            yield `data: ${JSON.stringify({ type: 'metadata', title, conversationId })}\n\n`; // Use the returned conversationId

            console.log("Sending metadata:", `data: ${JSON.stringify({ type: 'metadata', title, conversationId })}\n\n`); // Log before yield

            const stream = await chatModel.stream([
                { role: "system", content: CONFIG.SYSTEM_PROMPT },
                ...history,
                { role: "user", content: message }
            ]);

            let fullResponse = '';
            for await (const chunk of stream) {
                if (chunk.content) {
                    fullResponse += chunk.content;
                    const contentEvent = `data: ${JSON.stringify({ type: 'content', content: chunk.content })}\n\n`;
                    yield contentEvent;
                    console.log("Sending content:", contentEvent); // Log before yield
                }
            }

            const endEvent = `data: ${JSON.stringify({ type: 'end', status: 'done' })}\n\n`;
            yield endEvent;
            console.log("Sending end:", endEvent); // Log before yield
            await saveMessages(conversationId, message, fullResponse);
            yield `data: ${JSON.stringify({ type: 'end', status: 'done' })}\n\n`;

        } catch (error) {
            const errorEvent = `data: ${JSON.stringify({ type: 'error', message: (error as any).message })}\n\n`;
            yield errorEvent;
            console.error('Stream error:', error);
            console.log("Sending error:", errorEvent); // Log before yield
        }
    }, {
        body: t.Object({
            message: t.String(),
            model: t.Optional(t.String()),
            provider: t.String()
        }),
        headers: t.Optional(t.Object({ apiKey: t.String() })),
        query: t.Object({
            conversationId: t.Optional(t.String())
        })
    })
    .post('/', async ({ body, query, request: { headers } }): Promise<ChatResponse> => {
        console.log("Sending chat");
        const { message, model = CONFIG.DEFAULT_MODEL,
            provider } = body;
        let { conversationId = `session-${Date.now()}` } = query;
        console.log(headers.get("apiKey"));

        try {
            const chatModel = createChatModel(model, provider, headers.get('apiKey') as string);
            const { title, history } = await initializeChat(conversationId, message, chatModel); // Get conversationId from initializeChat

            const response = await chatModel.invoke([
                { role: "system", content: CONFIG.SYSTEM_PROMPT },
                ...history,
                { role: "user", content: message }
            ]);

            await saveMessages(conversationId, message, response.content as string);

            return {
                status: 'success',
                data: {
                    response: response.content as string,
                    conversation_id: conversationId,
                    title
                }
            };
        } catch (error) {
            console.error('Chat error:', error);
            return {
                status: 'error',
                message: 'Failed to process chat message'
            };
        }
    },
        {
            body: t.Object({
                message: t.String(),
                model: t.Optional(t.String()),
                provider: t.String()
            }),
            headers: t.Optional(t.Object({ apiKey: t.String() })),
            query: t.Object({
                conversationId: t.Optional(t.String())
            }),
            response: chatResponseSchema
        }
    );