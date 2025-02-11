import { PGlite } from '@electric-sql/pglite';
import { ChatMessage, MessageContent } from "@langchain/core/messages";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import React, { useEffect, useState } from 'react';
import { vector } from '@electric-sql/pglite/vector';
import { live } from '@electric-sql/pglite/live';
import { PGliteProvider } from '@/lib/pglite';

// Types
interface Message {
    role: 'system' | 'user' | 'assistant' | string;
    content: string | MessageContent;
}

interface ChatProps {
    systemPrompt?: string;
}

const ChatService: React.FC<ChatProps> = ({
    systemPrompt = "You are a helpful assistant."
}) => {
    const [db, setDb] = useState<(PGlite & { live: typeof live | any; vector: typeof vector | any }) | null>(null);
    const [apiKey, setApiKey] = useState<string>(import.meta.env.VITE_OPENAI_API_KEY);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'system', content: systemPrompt }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [llm, setLLM] = useState<ChatOpenAI | null>(null);
    const [embeddings, setEmbeddings] = useState<OpenAIEmbeddings | null>(null);

    useEffect(() => {
        const initializeDb = async () => {
            try {
                const database = await PGlite.create("idb://hasbase", {
                    extensions: { live, vector },
                });

                await database.query(`CREATE EXTENSION IF NOT EXISTS vector;`);
    
                // Initialize vector store table
                await database.query(`
                    CREATE TABLE IF NOT EXISTS vector_store (
                        id SERIAL PRIMARY KEY,
                        content TEXT,
                        embedding VECTOR(3072)
                    );
                `);
    
                // Initialize chat memory table with a unique constraint
                await database.query(`
                    CREATE TABLE IF NOT EXISTS chat_memory (
                        id SERIAL PRIMARY KEY,
                        conversation_id TEXT UNIQUE,
                        messages JSONB
                    );
                `);
    
                setDb(database);
    
                // Initialize ChatOpenAI
                const chatModel = new ChatOpenAI({
                    openAIApiKey: apiKey,
                    modelName: "gpt-4",
                    temperature: 0,
                });
    
                // Initialize embeddings
                const embeddingsModel = new OpenAIEmbeddings({
                    openAIApiKey: apiKey,
                    modelName: "text-embedding-3-large"
                });
    
                setLLM(chatModel);
                setEmbeddings(embeddingsModel);
            } catch (error) {
                console.error("Database initialization error:", error);
            }
        };
    
        initializeDb();
    }, []);
    

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !llm || !embeddings || !db) return;
    
        setLoading(true);
        const newMessages = [...messages, { role: 'user', content: input }];
        setMessages(newMessages);
    
        try {
            // Convert messages to ChatMessage format
            const chatMessages = newMessages.map(msg => ({
                role: msg.role,
                content: msg.content
            })) as ChatMessage[];
    
            // Get AI response
            const aiMsg = await llm.invoke(chatMessages);
    
            // Store in vector store
            const embedding = await embeddings.embedQuery(input);
    
            // Ensure the embedding is formatted as an array
            const formattedEmbedding = `[${embedding.join(',')}]`;
    
            await db.query(
                'INSERT INTO vector_store (content, embedding) VALUES (\$1, \$2)',
                [input, formattedEmbedding]
            );
    
            // Store in chat memory
            await db.query(
                `INSERT INTO chat_memory (conversation_id, messages)
                 VALUES (\$1, \$2)
                 ON CONFLICT (conversation_id)
                 DO UPDATE SET messages = EXCLUDED.messages || \$2::jsonb`,
                ['default', JSON.stringify(chatMessages)]
            );
    
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: aiMsg.content
            }]);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
            setInput('');
        }
    };
    
    const searchSimilarMessages = async (query: string) => {
        if (!embeddings || !db) return [];

        const queryEmbedding = await embeddings.embedQuery(query);

        // Perform similarity search using cosine similarity
        const results = await db.query(
            `SELECT content, 
                    1 - (embedding <=> \$1::vector) as similarity
             FROM vector_store
             WHERE 1 - (embedding <=> \$1::vector) > 0.8
             ORDER BY similarity DESC
             LIMIT 5`,
            [queryEmbedding]
        );

        return results.rows;
    };

    if (!db) {
        return <div>Loading database...</div>;
    }

    return (
        <PGliteProvider db={db}>
            <div className="max-w-2xl mx-auto p-4">
                <div className="bg-white rounded-lg shadow-lg p-6 mb-4 min-h-[400px] max-h-[600px] overflow-y-auto">
                    {messages.slice(1).map((message, index) => (
                        <div
                            key={index}
                            className={`mb-4 ${message.role === 'assistant' ? 'text-blue-600' : 'text-gray-800'}`}
                        >
                            <strong>{message.role === 'assistant' ? 'AI: ' : 'You: '}</strong>
                            {message.content.toString()}
                        </div>
                    ))}
                    {loading && <div className="text-gray-500">AI is thinking...</div>}
                </div>

                <form onSubmit={handleSubmit} className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="flex-1 p-2 border border-gray-300 rounded"
                        placeholder="Type your message..."
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
                        disabled={loading || !input.trim()}
                    >
                        Send
                    </button>
                </form>
            </div>
        </PGliteProvider>
    );
};

export default ChatService;
