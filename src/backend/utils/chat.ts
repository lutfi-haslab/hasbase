// utils/chat.ts

import { ChatOllama } from "@langchain/ollama";
import { ChatOpenAI } from "@langchain/openai";
import { chatDB } from "../db";
import { CONFIG } from "../config";
import { ChatMessage } from "../model";

export const createChatModel = (modelName: string, provider: string, apiKey?: string, streaming = false) => {
    if (provider === "openai") {
        return new ChatOpenAI({
            modelName,
            // apiKey: CONFIG.OPEN_AI_API_KEY,
            apiKey,
            streaming
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

export const generateTitle = async (firstMessage: string, model: ChatOpenAI | ChatOllama): Promise<string> => {
    const titlePrompt = [
        {
            role: "system",
            content: "Generate a short, concise title (maximum 6 words) for a conversation that starts with this message. Just return the title without any additional text or punctuation."
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
    conversationId: string,
    message: string,
    model: ChatOpenAI | ChatOllama
) => {
    let title: string;
    let chatExists = false;

    try {
        const chatData = await chatDB.getData(`/chats/${conversationId}`);
        chatExists = true;
        title = chatData.title;
    } catch (error) {
        // New conversation
        title = await generateTitle(message, model);
        await chatDB.push(`/chats/${conversationId}`, {
            title,
            messages: []
        });
    }

    const history = await getChatHistory(conversationId);

    return {
        title,
        history: history.map(msg => ({
            role: msg.role,
            content: msg.content
        })),
        isNew: !chatExists
    };
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