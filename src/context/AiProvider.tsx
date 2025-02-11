

import { useDB } from '@/context/DbProvider';
import { useGetChatMemory } from '@/hooks/useGetChatMemrory';
import { AIService } from "@/service/aiService";
import { useModelStore } from '@/store/modelStore';
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { ChatMessage, MessageContent } from '@langchain/core/messages';
import { OpenAIEmbeddings } from '@langchain/openai';
import React, { createContext, useContext, useEffect, useState } from 'react';

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

interface Language {
    value: string;
    label: string;
}

interface TranslationMessage {
    role: 'user' | 'assistant';
    content: string;
    fromLang: string;
    toLang: string;
}


interface LearningMessage {
    role: 'user' | 'assistant';
    content: string;
    topic: string;
}

interface AiContextType {
    // Chat related states
    messages: Message[];
    chats: Chat[];
    currentChat: string | null;

    // Shared states
    input: string;
    loading: boolean;
    streamingContent: string;
    llm: BaseChatModel | null;
    embeddings: OpenAIEmbeddings | null;
    title: string;
    isSessionMode: boolean;
    // Methods
    setInput: (input: string) => void;
    handleSubmit: (e: React.FormEvent) => Promise<void>;
    createNewChat: () => Promise<void>;
    createSessionChat: () => void;
    switchChat: (conversationId: string) => void;
    loadChat: (conversationId: string) => Promise<void>;
    addEmbeddings: () => Promise<void>;
    toggleSessionMode: () => void;
}

const AiContext = createContext<AiContextType | undefined>(undefined);

const SYSTEM_PROMPT = "You are a helpful assistant specializing in language translation and grammar explanation.";
const TRANSLATION_PROMPT = "You are a precise translator. Provide only the direct translation without any additional explanations or commentary unless specifically requested.";
const LEARNING_PROMPT = "You are a helpful assistant and become a personal teacher to help students learn a new topic. you will teach the student by providing explanations, examples, and exercises to reinforce learning. You will also provide feedback to the student to help them understand concepts better. you are good for this topics, including English, coding, biology, physics. show explanation maximal in 150 words.";

const DEFAULT_LANGUAGES: Language[] = [
    { value: 'id', label: 'Indonesian' },
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
    { value: 'zh', label: 'Chinese' },
    { value: 'ja', label: 'Japanese' },
    { value: 'ko', label: 'Korean' }
];



export const AiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const db = useDB();
    const { selectedModel, temperature, topP, topK, endpoints, apiKeys } = useModelStore();
    const { refetch } = useGetChatMemory();

    // Chat states
    const [messages, setMessages] = useState<Message[]>([
        { role: 'system', content: SYSTEM_PROMPT }
    ]);
    // Shared states
    const [currentChat, setCurrentChat] = useState<string | null>(null);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [streamingContent, setStreamingContent] = useState<string>('');
    const [title, setTitle] = useState<string>('New Translation');
    const [llm, setLLM] = useState<BaseChatModel | null>(null);
    const [embeddings, setEmbeddings] = useState<OpenAIEmbeddings | null>(null);
    const [chats, setChats] = useState<Chat[]>([]);
    const [isSessionMode, setIsSessionMode] = useState<boolean>(false);

    // Initialize AI models
    useEffect(() => {
        initializeAI();
    }, [selectedModel.id]);

    const initializeAI = async () => {
        try {
            const model = AIService.createChatModel();
            const embeddingsModel = AIService.createEmbeddingsModel();
            setLLM(model);
            setEmbeddings(embeddingsModel);
            const result = await db.query('SELECT * FROM chat_memory ORDER BY id DESC') as { rows: Chat[] };
            setChats(result.rows);
        } catch (err) {
            console.error("AI initialization error:", err);
        }
    };

    // ... (keep existing chat-related methods: handleSubmit, createNewChat, loadChat, etc.)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !llm) return;

        setLoading(true);
        setStreamingContent('');

        try {
            const newMessages = [...messages, { role: 'user', content: input }];
            setMessages(newMessages);

            const chatMessages = newMessages.map(msg => ({
                role: msg.role,
                content: msg.content
            })) as ChatMessage[];

            let fullResponse = '';
            const stream = await llm.stream(chatMessages);

            for await (const chunk of stream) {
                if (chunk.content) {
                    fullResponse += chunk.content;
                    setStreamingContent(prev => prev + chunk.content);
                }
            }

            const updatedMessages = [...newMessages, {
                role: 'assistant',
                content: fullResponse
            }];

            if (!isSessionMode && currentChat) {
                const existingChat: any = await db.query(
                    'SELECT title FROM chat_memory WHERE conversation_id = $1',
                    [currentChat]
                );

                let title = existingChat.rows.length === 0 || existingChat.rows[0].title === "New Translation"
                    ? await generateTitle(input) as string
                    : existingChat.rows[0].title;

                await db.query(
                    `UPDATE chat_memory 
                        SET messages = $1, title = $2
                        WHERE conversation_id = $3`,
                    [JSON.stringify(updatedMessages), title, currentChat]
                );

                refetch();
                setTitle(title);

                const result = await db.query('SELECT * FROM chat_memory ORDER BY id DESC') as { rows: Chat[] };
                setChats(result.rows);
            }

            setMessages(updatedMessages);
            setStreamingContent('');

        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
            setInput('');
        }
    };

    const addEmbeddings = async () => {
        if (!embeddings || !input.trim()) return;

        const embedding = await embeddings.embedQuery(input);
        const formattedEmbedding = `[${embedding.join(',')}]`;

        await db.query(
            'INSERT INTO vector_store (content, embedding) VALUES ($1, $2)',
            [input, formattedEmbedding]
        );
    };

    const generateTitle = async (content: string) => {
        if (!llm) return "New Translation";
        const titlePrompt = `Generate a brief title (max 6 words) for this translation: "${content}"`;
        const titleResponse = await llm.invoke([{ role: 'user', content: titlePrompt }]);
        return titleResponse.content;
    };

    const createSessionChat = () => {
        const conversationId = `session-${Date.now()}`;
        const initialMessages = [{ role: 'system', content: SYSTEM_PROMPT }];

        setCurrentChat(conversationId);
        setMessages(initialMessages);
        setTitle('Translation Session');
        setIsSessionMode(true);
    };

    const toggleSessionMode = () => {
        setIsSessionMode(!isSessionMode);
        if (!isSessionMode) {
            createSessionChat();
        }
    };

    const createNewChat = async () => {
        if (isSessionMode) {
            createSessionChat();
            return;
        }

        const conversationId = Date.now().toString();
        const initialMessages = [{ role: 'system', content: SYSTEM_PROMPT }];

        await db.query(
            'INSERT INTO chat_memory (conversation_id, title, messages) VALUES ($1, $2, $3)',
            [conversationId, "New Translation", JSON.stringify(initialMessages)]
        );
        refetch();

        setCurrentChat(conversationId);
        setMessages(initialMessages);
    };

    const loadChat = async (conversationId: string) => {
        if (isSessionMode) return;

        const result: any = await db.query(
            'SELECT * FROM chat_memory WHERE conversation_id = $1',
            [conversationId]
        );

        if (result && result.rows.length > 0) {
            setTitle(result.rows[0].title);
            setMessages(result.rows[0].messages);
            setCurrentChat(conversationId);
        }
    };

    const switchChat = async (conversationId: string) => {
        if (isSessionMode) return;
        setCurrentChat(conversationId);
        loadChat(conversationId);
    };


    return (
        <AiContext.Provider value={{
            // Chat states
            messages,
            chats,
            currentChat,

            // Shared states
            input,
            loading,
            streamingContent,
            llm,
            embeddings,
            title,
            isSessionMode,

            // Methods
            setInput,
            handleSubmit,
            createNewChat,
            createSessionChat,
            switchChat,
            loadChat,
            addEmbeddings,
            toggleSessionMode
        }}>
            {children}
        </AiContext.Provider>
    );
};

export const useAiContext = () => {
    const context = useContext(AiContext);
    if (context === undefined) {
        throw new Error('useAiContext must be used within an AiProvider');
    }
    return context;
};