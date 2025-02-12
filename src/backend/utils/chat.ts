// utils/chat.ts

import { ChatDeepSeek } from "@langchain/deepseek";
import { ChatOllama } from "@langchain/ollama";
import { ChatOpenAI } from "@langchain/openai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { chatDB } from "../db";
import { ChatMessage } from "../model";
import { v4 as uuidv4 } from 'uuid'; // Import uuid library (if not already installed: npm install uuid)


export const createChatModel = (modelName: string, provider: string, apiKey?: string, streaming = false) => {
    if (provider === "openai") {
        return new ChatOpenAI({
            model: modelName,
            // apiKey: CONFIG.OPEN_AI_API_KEY,
            apiKey,
            streaming
        });
    } else if (provider === "deepseek") {
        return new ChatDeepSeek({
            model: modelName,
            temperature: 0,
            apiKey
            // other params...
        });

    } else if (provider === "gemini") {
        return new ChatGoogleGenerativeAI({
            model: modelName,
            temperature: 0,
            maxRetries: 2,
            apiKey
        });
    } else {
        return new ChatOllama({
            model: modelName,
            temperature: 0,
            maxRetries: 2,
            streaming
        });
    }
};

export const generateTitle = async (firstMessage: string, model: ChatOpenAI | ChatOllama | ChatDeepSeek | ChatGoogleGenerativeAI): Promise<string> => {
    const titlePrompt = [
        {
            role: "system",
            content: "Generate very very very short title based on context, just few words, no punctuation. max 3 words"
        },
        {
            role: "user",
            content: firstMessage
        }
    ];

    const titleResponse = await model.invoke(titlePrompt);
    return titleResponse.content as string;
};

export const getChatHistory = async (conversationId: string): Promise<ChatMessage[]> => {
    try {
        const chatData = await chatDB.getData(`/chats/${conversationId}/messages`);
        return chatData || [];
    } catch (error) {
        return [];
    }
};

export const initializeChat = async (
    providedConversationId: string | undefined,
    message: string,
    model: ChatOpenAI | ChatOllama | ChatDeepSeek | ChatGoogleGenerativeAI
) => {
    const conversationId = providedConversationId || uuidv4(); // Use provided ID or generate a UUID
    const timestamp = new Date().toISOString();

    try {
        // Attempt to retrieve existing chat data.  This is the primary path.
        const chatData = await chatDB.getData(`/chats/${conversationId}`);
        const history = await getChatHistory(conversationId);

        return {
            title: chatData.title,
            history: history.map(msg => ({ role: msg.role, content: msg.content })),
            conversationId,
            isNew: false // Chat exists
        };
    } catch (error) {
        // Handle new chat creation.  This is the fallback path.
        const title = await generateTitle(message, model);

        // Create the chat entry.  No need for a separate push/setData if it doesn't exist.
        await chatDB.push(`/chats/${conversationId}`, { title, messages: [], timestamp });

        return {
            title,
            history: [], // No history for a new chat
            conversationId,
            isNew: true // Chat is new
        };
    }
};

export const saveMessages = async (
    conversationId: string,
    userMessage: string,
    assistantMessage: string
) => {
    const timestamp = new Date().toISOString();

    const messages: ChatMessage[] = [
        {
            role: 'user',
            content: userMessage,
            timestamp
        },
        {
            role: 'assistant',
            content: assistantMessage,
            timestamp
        }
    ];

    for (const message of messages) {
        await chatDB.push(`/chats/${conversationId}/messages[]`, message, true);
    }
};

// Helper function to ensure conversation exists
export const ensureConversation = async (
    conversationId: string,
    title: string = "New Conversation"
) => {
    try {
        await chatDB.getData(`/chats/${conversationId}`);
    } catch (error) {
        await chatDB.push(`/chats/${conversationId}`, {
            title,
            messages: []
        });
    }
};

// Helper function to format chat messages for model context
export const formatChatContext = (
    systemPrompt: string,
    history: {
        role: "user" | "system" | "assistant";
        content: string;
    }[],
    newMessage: string
) => {
    return [
        {
            role: "system",
            content: systemPrompt
        },
        ...history.map(msg => ({
            role: msg.role,
            content: msg.content
        })),
        {
            role: "user",
            content: newMessage
        }
    ];
};
