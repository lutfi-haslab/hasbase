import { MessageContent } from "@langchain/core/messages";
import { t } from "elysia";

// types.ts

export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
    timestamp: string | any;
}

export interface ChatSession {
    session_id: string;
    title: string;
    messages: ChatMessage[];
}

export interface DocumentMetadata {
    id: string;
    filename: string;
    createdAt: string;
    status: 'processing' | 'complete' | 'failed';
    chunks: number;
    error?: string;
}

export interface ChatResponse {
    status: 'success' | 'error';
    data?: {
        response: string;
        conversation_id: string;
        title: string;
    };
    message?: string;
}

export interface DocumentChatResponse {
    response: string;
    conversation_id: string;
    contextSources: Array<{ content: string }>;
}

// Schema validation types
export const chatMessageSchema = t.Object({
    role: t.Union([t.Literal('system'), t.Literal('user'), t.Literal('assistant')]),
    content: t.String(),
    timestamp: t.Date()
});

export const chatSessionSchema = t.Object({
    session_id: t.String(),
    title: t.String(),
    messages: t.Array(chatMessageSchema)
});

export const documentMetadataSchema = t.Object({
    id: t.String(),
    filename: t.String(),
    createdAt: t.String(),
    status: t.Union([
        t.Literal('processing'),
        t.Literal('complete'),
        t.Literal('failed')
    ]),
    chunks: t.Number(),
    error: t.Optional(t.String())
});

export const chatResponseSchema = t.Object({
    status: t.Union([t.Literal('success'), t.Literal('error')]),
    data: t.Optional(t.Object({
        response: t.String(),
        conversation_id: t.String(),
        title: t.String()
    })),
    message: t.Optional(t.String())
});

export const documentChatResponseSchema = t.Object({
    status: t.Union([t.Literal('success'), t.Literal('error')]),
    data: t.Object({
        response: t.String(),
        conversation_id: t.String(),
        contextSources: t.Array(t.Object({
            content: t.String()
        }))
    })
});