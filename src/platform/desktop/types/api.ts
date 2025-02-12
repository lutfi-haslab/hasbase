// API Response Types
export interface HealthResponse {
  status: 'ok';
}

export interface ConnectResponse {
  status: 'connected';
}

export interface SystemInfoResponse {
  version: string;
  description: string;
  uptime: string;
}

export interface ChatMessage {
  role: string;
  content: string;
  timestamp: string;
  streaming?: boolean; // Add this line
}

export interface ChatHistoryResponse {
  history: ChatMessage[];
}

export interface Conversation {
  session_id: string;
  title: string;
  messages: ChatMessage[];
}

export interface ConversationsResponse {
  conversations: Conversation[];
}

export interface ChatStreamResponse {
  status: string;
  stream: string;
}

export interface ChatResponse {
  status: string;
  data: {
    response: string;
    conversation_id: string;
    title: string;
  };
}

export interface Document {
  id: string;
  name: string;
  created_at: string;
  status?: string;
  chunks?: number;
  textPreview?: string;
  content?: string;
}


export interface DocumentListInfo {
  "id": string;
  "filename": string;
  "status": string;
  "chunks": number;
  "createdAt": string;
}
export interface DocumentsResponse {
  documents: Document[];
}

export interface DocumentUploadResponse {
  id: string;
  status: string;
  chunks: number;
  textPreview: string;
}

export interface DocumentChatResponse {
  response: string;
  contextSources: Array<{ content: string }>;
}

export interface DocumentConversation {
  session_id: string;
  title: string;
}

export interface DocumentConversationsResponse {
  conversations: DocumentConversation[];
}

export interface DocumentQueryResult {
  content: string;
}

export interface DocumentQueryResponse {
  results: DocumentQueryResult[];
}

export interface User {
  id: string;
  username: string;
  email: string;
  created_at?: string;
}

export interface UsersResponse {
  users: User[];
}

export interface CreateUserResponse {
  status: string;
  user: User;
}
