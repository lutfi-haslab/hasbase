
// aiService.ts

import { ChatAnthropic } from "@langchain/anthropic";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { ChatOllama } from "@langchain/ollama";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { useModelStore } from "../store/modelStore";


export class AIService {
    static createChatModel(): BaseChatModel {
        const { selectedModel, endpoints, apiKeys, temperature, topP, topK } = useModelStore.getState();

        const baseConfig = {
            temperature,
            topP,
            streaming: true,
        };

        switch (selectedModel.provider) {
            case 'openai':
                return new ChatOpenAI({
                    ...baseConfig,
                    openAIApiKey: apiKeys.openai,
                    modelName: selectedModel.id,
                });

            case 'anthropic':
                return new ChatAnthropic({
                    ...baseConfig,
                    anthropicApiKey: apiKeys.anthropic,
                    model: selectedModel.id,
                    topK,
                });

            case 'ollama':
                return new ChatOllama({
                    ...baseConfig,
                    model: selectedModel.id,
                    maxRetries: 2,
                    baseUrl: endpoints.ollama,
                });

            default:
                throw new Error(`Unsupported model provider: ${selectedModel.provider}`);
        }
    }

    static createEmbeddingsModel() {
        const { apiKeys } = useModelStore.getState();

        return new OpenAIEmbeddings({
            openAIApiKey: apiKeys.openai,
            modelName: "text-embedding-3-large"
        });
    }
}
