// types.ts
export type ModelProvider = 'openai' | 'anthropic' | 'ollama';

export interface Model {
  id: string;
  name: string;
  provider: ModelProvider;
}

export interface ModelState {
  selectedModel: Model;
  temperature: number;
  topP: number;
  topK: number;
  endpoints: Record<ModelProvider, string>;
  apiKeys: Record<ModelProvider, string>;
  setModel: (model: Model) => void;
  setEndpoint: (provider: ModelProvider, endpoint: string) => void;
  setApiKey: (provider: ModelProvider, apiKey: string) => void;
  setOptions: (options: { temperature?: number; topP?: number; topK?: number }) => void;
}

// modelStore.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

const DEFAULT_ENDPOINTS: Record<ModelProvider, string> = {
  openai: 'https://api.openai.com',
  anthropic: 'https://api.anthropic.com',
  ollama: 'http://localhost:11434',
};

export const AVAILABLE_MODELS: Model[] = [
  { id: 'chatgpt-4o-latest', name: 'GPT-4o Latest', provider: 'openai' },
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai' },
  { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', provider: 'anthropic' },
  { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', provider: 'anthropic' },
  { id: 'qwen:0.5b', name: 'Qwen 0.5b', provider: 'ollama' },
  { id: 'qwen:1b', name: 'Qwen 1b', provider: 'ollama' },
  { id: 'qwen2.5-coder:1.5b', name: 'Qwen Coder 1.5b', provider: 'ollama' },
];

export const useModelStore = create<ModelState>()(
  devtools(
    persist(
      (set) => ({
        selectedModel: AVAILABLE_MODELS[0],
        temperature: 0,
        topP: 1,
        topK: 40,
        endpoints: DEFAULT_ENDPOINTS,
        apiKeys: {
          openai: import.meta.env.VITE_OPENAI_API_KEY ?? '',
          anthropic: import.meta.env.VITE_ANTHROPIC_API_KEY ?? '',
          ollama: import.meta.env.VITE_OLLAMA_API_KEY ?? '',
        },
        setModel: (model) => set({ selectedModel: model }),
        setEndpoint: (provider, endpoint) =>
          set((state) => ({
            endpoints: { ...state.endpoints, [provider]: endpoint }
          })),
        setApiKey: (provider, apiKey) =>
          set((state) => ({
            apiKeys: { ...state.apiKeys, [provider]: apiKey }
          })),
        setOptions: (options) => set((state) => ({ ...state, ...options })),
      }),
      {
        name: 'model-storage',
      }
    )
  )
);