import { QueryObserverResult, useQuery } from "@tanstack/react-query";
import { useDB } from "../context/DbProvider";
import { MessageContent } from "@langchain/core/messages";

interface Message {
    role: 'system' | 'user' | 'assistant' | string;
    content: string | MessageContent;
}

interface Chat {
    id: number;
    conversation_id: string;
    title: string;
    messages: Message[];
}

export const useGetChatMemory = (): {
    data: {
        rows: Chat[]; // Memastikan bahwa data.rows adalah Chat[]
    } | undefined; 
    isLoading: boolean; 
    error: unknown;
    refetch: () => Promise<QueryObserverResult<{
        rows: Chat[];
    }, Error>>
} => {
    const db = useDB();
    const query = useQuery({
        queryKey: ['chat-lists'],
        queryFn: async () => {
            const result = await db.query(`SELECT * FROM chat_memory ORDER BY created_at DESC;`);
            return { rows: result.rows as Chat[] }; // Memastikan tipe data yang dikembalikan sesuai
        }
    });

    return {
        ...query
    };
}