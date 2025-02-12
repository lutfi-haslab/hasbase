import { create } from 'zustand';
import { ChatMessage, Document } from '../types/api';

interface ModelConfig {
  provider: string;
  apiKey: string;
  model: string;
}

interface ChatState {
  messages: ChatMessage[];
  documents: Document[];
  selectedDocument?: string;
  currentConversationId?: string;
  inputValue: string;
  showUploadModal: boolean;
  showModelModal: boolean;
  activeTab: 'chats' | 'documents';
  selectedModelConfig?: ModelConfig;
  customModels: ModelConfig[];

  setMessages: (messages: ChatMessage[]) => void;
  addMessage: (message: ChatMessage) => void;
  setDocuments: (documents: Document[]) => void;
  addDocument: (document: Document) => void;
  setSelectedDocument: (documentId?: string) => void;
  setCurrentConversationId: (id?: string) => void;
  setInputValue: (value: string) => void;
  setShowUploadModal: (show: boolean) => void;
  setShowModelModal: (show: boolean) => void;
  setActiveTab: (tab: 'chats' | 'documents') => void;
  setSelectedModelConfig: (config: ModelConfig | undefined) => void;
  addCustomModel: (config: ModelConfig) => void;
  reset: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  documents: [],
  selectedDocument: undefined,
  currentConversationId: undefined,
  inputValue: '',
  showUploadModal: false,
  showModelModal: false,
  activeTab: 'chats',
  selectedModelConfig: undefined,
  customModels: [],

  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  setDocuments: (documents) => set({ documents }),
  addDocument: (document) => set((state) => ({ documents: [...state.documents, document] })),
  setSelectedDocument: (documentId) => set({ selectedDocument: documentId }),
  setCurrentConversationId: (id) => set({ currentConversationId: id }),
  setInputValue: (value) => set({ inputValue: value }),
  setShowUploadModal: (show) => set({ showUploadModal: show }),
  setShowModelModal: (show) => set({ showModelModal: show }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedModelConfig: (config) => set({ selectedModelConfig: config }),
  addCustomModel: (config) => set((state) => ({
    customModels: [...state.customModels, config]
  })),
  reset: () => set({
    messages: [],
    selectedDocument: undefined,
    currentConversationId: undefined,
    inputValue: '',
  }),
}));