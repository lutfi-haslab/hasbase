import { API_BASE_URL } from '../core/config';
import {
  ChatMessage,
  ChatResponse,
  ChatStreamResponse,
  ConnectResponse,
  Conversation,
  CreateUserResponse,
  Document,
  DocumentConversationsResponse,
  DocumentListInfo,
  DocumentQueryResponse,
  DocumentUploadResponse,
  HealthResponse,
  SystemInfoResponse,
  User,
  UsersResponse
} from '../types/api';

// Health and System
export async function checkHealth(): Promise<HealthResponse> {
  const response = await fetch(`${API_BASE_URL}/health`);
  return response.json();
}

export async function checkConnection(): Promise<ConnectResponse> {
  const response = await fetch(`${API_BASE_URL}/v1/connect`);
  return response.json();
}

export async function getSystemInfo(): Promise<SystemInfoResponse> {
  const response = await fetch(`${API_BASE_URL}/info`);
  return response.json();
}

// Chat
export async function fetchChatHistory(conversationId: string): Promise<ChatMessage[]> {
  const response = await fetch(`${API_BASE_URL}/v1/chat/history?conversationId=${conversationId}`);
  return response.json();
}

export async function fetchConversations(): Promise<Conversation[]> {
  const response = await fetch(`${API_BASE_URL}/v1/chat/conversations`);
  return await response.json();
}

export async function sendChatMessage(
  message: string,
  conversationId?: string,
  model?: string,
  apiKey: string = "",
  provider: string = "openai"
): Promise<ChatResponse> {
  const response = await fetch(
    `${API_BASE_URL}/v1/chat${conversationId ? `?conversationId=${conversationId}` : ''}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', "apiKey": apiKey },
      body: JSON.stringify({ message, model, provider }),
    }
  );
  return response.json();
}

export async function sendStreamingChatMessage(
  message: string,
  conversationId?: string,
  model?: string,
  apiKey: string = "",
  provider: string = "openai"
): Promise<ChatStreamResponse> {
  const response = await fetch(
    `${API_BASE_URL}/v1/chat/stream${conversationId ? `?conversationId=${conversationId}` : ''}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apiKey: apiKey },
      body: JSON.stringify({ message, model, provider }),
    }
  );
  return response.json();
}

// Documents
export async function fetchDocuments(): Promise<DocumentListInfo[]> {
  const response = await fetch(`${API_BASE_URL}/v1/documents`);
  return await response.json();
}

export async function uploadDocument(file: File, apiKey: string): Promise<DocumentUploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/v1/documents/upload`, {
    method: 'POST',
    body: formData,
    headers: { 'Content-Type': 'multipart/form-data', "apiKey": apiKey },
  },);
  return response.json();
}

export async function getDocument(documentId: string): Promise<Document> {
  const response = await fetch(`${API_BASE_URL}/v1/documents/${documentId}`);
  return response.json();
}

export async function chatWithDocument(
  documentId: string,
  question: string,
  numContext?: number,
  conversationId?: string,
  model: string = "",
  apiKey: string = "",
  provider: string = "openai"
): Promise<ChatResponse> {
  const response = await fetch(
    `${API_BASE_URL}/v1/documents/${documentId}/chat${conversationId ? `?conversationId=${conversationId}` : ''
    }`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', "apiKey": apiKey },
      body: JSON.stringify({ question, num_context: numContext, provider, model }),
    }
  );
  return response.json();
}

export async function getDocumentConversations(
  documentId: string
): Promise<DocumentConversationsResponse> {
  const response = await fetch(`${API_BASE_URL}/v1/documents/${documentId}/conversations`);
  return response.json();
}

export async function queryDocument(
  documentId: string,
  query: string,
  numResults: number = 2,
  apiKey: string
): Promise<DocumentQueryResponse> {
  const response = await fetch(`${API_BASE_URL}/v1/documents/${documentId}/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', "apiKey": apiKey },
    body: JSON.stringify({ query, num_results: numResults }),
  });
  return response.json();
}

// Users
export async function fetchUsers(): Promise<UsersResponse> {
  const response = await fetch(`${API_BASE_URL}/v1/users`);
  return response.json();
}

export async function createUser(username: string, email: string): Promise<CreateUserResponse> {
  const response = await fetch(`${API_BASE_URL}/v1/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email }),
  });
  return response.json();
}

export async function getUser(userId: string): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/v1/users/${userId}`);
  return response.json();
}