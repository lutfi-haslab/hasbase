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

            return Object.entries(chatData).map(([sessionId, session]: [string, any]) => ({
                session_id: sessionId,
                title: session.title,
                messages: session.messages
            }));
        } catch (error) {
            console.error("Error fetching chat data:", error);
            return [];
        }
    }, {
        response: t.Array(chatSessionSchema)
    })

    .post('/stream', async function* ({ query, body, headers }) {
        const { message, model = CONFIG.DEFAULT_MODEL,
            provider } = body;
        let { conversationId = `session-${Date.now()}` } = query;

        try {
            const chatModel = createChatModel(model, provider, headers['apiKey'] as string, true);
            const { title, history } = await initializeChat(conversationId, message, chatModel);

            yield JSON.stringify({ type: 'metadata', title, conversationId }) + '\n';

            const stream = await chatModel.stream([
                { role: "system", content: CONFIG.SYSTEM_PROMPT },
                ...history,
                { role: "user", content: message }
            ]);

            let fullResponse = '';
            for await (const chunk of stream) {
                if (chunk.content) {
                    fullResponse += chunk.content;
                    yield JSON.stringify({ type: 'content', content: chunk.content }) + '\n';
                }
            }

            await saveMessages(conversationId, message, fullResponse);
            yield JSON.stringify({ type: 'end', status: 'done' }) + '\n';
        } catch (error) {
            console.error('Stream error:', error);
            yield JSON.stringify({ type: 'error', message: (error as any).message }) + '\n';
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
        const { message, model = CONFIG.DEFAULT_MODEL,
            provider } = body;
        let { conversationId = `session-${Date.now()}` } = query;
        console.log(headers.get("apiKey"));

        try {
            const chatModel = createChatModel(model, provider, headers.get('apiKey') as string);
            const { title, history } = await initializeChat(conversationId, message, chatModel);

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