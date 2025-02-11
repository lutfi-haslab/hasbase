import { ChatOpenAI } from "@langchain/openai";
import { FileSystemChatMessageHistory } from "@langchain/community/stores/message/file_system";
import { RunnableWithMessageHistory } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import {
    ChatPromptTemplate,
    MessagesPlaceholder,
} from "@langchain/core/prompts";

class ChatService {
    private model: ChatOpenAI;
    private chainWithHistory: RunnableWithMessageHistory<any, any>;

    constructor() {
        this.model = new ChatOpenAI({
            model: "gpt-3.5-turbo",
            temperature: 0,
            apiKey: import.meta.env.VITE_OPENAI_API_KEY,
        });

        const prompt = ChatPromptTemplate.fromMessages([
            [
                "system",
                "You are a helpful assistant. Answer all questions to the best of your ability.",
            ],
            new MessagesPlaceholder("chat_history"),
            ["human", "{input}"],
        ]);

        const chain = prompt.pipe(this.model).pipe(new StringOutputParser());

        this.chainWithHistory = new RunnableWithMessageHistory({
            runnable: chain,
            inputMessagesKey: "input",
            historyMessagesKey: "chat_history",
            getMessageHistory: async (sessionId) => {
                const chatHistory = new FileSystemChatMessageHistory({
                    sessionId,
                    userId: "user-id",
                });
                return chatHistory;
            },
        });
    }

    async invoke(input: string, sessionId: string) {
        return await this.chainWithHistory.invoke(
            { input },
            { configurable: { sessionId } }
        );
    }

    async setContext(sessionId: string, context: Record<string, unknown>) {
        const chatHistory = (await this.chainWithHistory.getMessageHistory(sessionId)) as FileSystemChatMessageHistory;
        await chatHistory.setContext(context);
    }

    async getAllSessions(sessionId: string) {
        const chatHistory = (await this.chainWithHistory.getMessageHistory(sessionId)) as FileSystemChatMessageHistory;
        return await chatHistory.getAllSessions();
    }
}

// Contoh penggunaan ChatService
export const chatService = new ChatService();

