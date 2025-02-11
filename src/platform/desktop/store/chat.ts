import { create } from 'zustand';
import { ChatMessage, Document } from '../types/api';

interface ChatState {
  messages: ChatMessage[];
  documents: Document[];
  selectedDocument?: string;
  currentConversationId?: string;
  inputValue: string;
  showUploadModal: boolean;
  activeTab: 'chats' | 'documents';
  setMessages: (messages: ChatMessage[]) => void;
  addMessage: (message: ChatMessage) => void;
  setDocuments: (documents: Document[]) => void;
  addDocument: (document: Document) => void;
  setSelectedDocument: (documentId?: string) => void;
  setCurrentConversationId: (id?: string) => void;
  setInputValue: (value: string) => void;
  setShowUploadModal: (show: boolean) => void;
  setActiveTab: (tab: 'chats' | 'documents') => void;
  reset: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  documents: [],
  selectedDocument: undefined,
  currentConversationId: undefined,
  inputValue: '',
  showUploadModal: false,
  activeTab: 'chats',

  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  setDocuments: (documents) => set({ documents }),
  addDocument: (document) => set((state) => ({ documents: [...state.documents, document] })),
  setSelectedDocument: (documentId) => set({ selectedDocument: documentId }),
  setCurrentConversationId: (id) => set({ currentConversationId: id }),
  setInputValue: (value) => set({ inputValue: value }),
  setShowUploadModal: (show) => set({ showUploadModal: show }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  reset: () => set({
    messages: [],
    selectedDocument: undefined,
    currentConversationId: undefined,
    inputValue: '',
  }),
}));