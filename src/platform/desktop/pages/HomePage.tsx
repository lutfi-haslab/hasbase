import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText, History, Plus, Send, Upload } from "lucide-react";
import { useEffect, useRef } from "react";
import { ChatMessage } from "../components/ChatMessage";
import { DocumentList } from "../components/DocumentList";
import { FileUpload } from "../components/FileUpload";
import * as api from "../lib/api";
import { useChatStore } from "../store/chat";
import { ChatMessage as ChatMessageType, ChatResponse } from "../types/api";

function HomePage() {
  const {
    messages,
    documents,
    selectedDocument,
    currentConversationId,
    inputValue,
    showUploadModal,
    activeTab,
    setMessages,
    addMessage,
    setDocuments,
    addDocument,
    setSelectedDocument,
    setCurrentConversationId,
    setInputValue,
    setShowUploadModal,
    setActiveTab,
    reset,
  } = useChatStore();

  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Queries
  const { data: chatHistory } = useQuery({
    queryKey: ["conversations"],
    queryFn: api.fetchConversations,
  });

  const { data: documentsList } = useQuery({
    queryKey: ["documents"],
    queryFn: async () => {
      const response = await api.fetchDocuments();
      return response;
    },
  });

  // Mutations
  const sendMessageMutation = useMutation({
    mutationFn: async ({
      message,
      conversationId,
    }: {
      message: string;
      conversationId?: string;
    }) => {
      if (selectedDocument) {
        return api.chatWithDocument(
          selectedDocument,
          message,
          undefined,
          conversationId
        );
      } else {
        return api.sendChatMessage(message, conversationId);
      }
    },
    onSuccess: (response: ChatResponse) => {
      const newMessage: ChatMessageType = {
        role: "assistant",
        content: response?.data?.response,
        timestamp: new Date().toISOString(),
      };
      addMessage(newMessage);

      setCurrentConversationId(response.data.conversation_id);
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  const uploadDocumentMutation = useMutation({
    mutationFn: api.uploadDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      setShowUploadModal(false);
    },
  });

  const handleNewChat = () => {
    reset();
  };

  const loadConversation = async (conversationId: string) => {
    try {
      const response = await api.fetchChatHistory(conversationId);

      setMessages(response);
      setCurrentConversationId(conversationId);
    } catch (error) {
      console.error("Error loading conversation:", error);
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const newMessage: ChatMessageType = {
      role: "user",
      content: inputValue,
      timestamp: new Date().toISOString(),
    };

    addMessage(newMessage);
    setInputValue("");

    sendMessageMutation.mutate({
      message: inputValue,
      conversationId: currentConversationId,
    });
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* New Chat Button */}
        <div className="p-4 border-b border-gray-200">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Chat
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("chats")}
            className={`flex-1 px-4 py-3 text-sm font-medium ${
              activeTab === "chats"
                ? "text-blue-600 border-b-2 border-blue-500"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <History className="w-4 h-4" />
              Chats
            </div>
          </button>
          <button
            onClick={() => setActiveTab("documents")}
            className={`flex-1 px-4 py-3 text-sm font-medium ${
              activeTab === "documents"
                ? "text-blue-600 border-b-2 border-blue-500"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <FileText className="w-4 h-4" />
              Documents
            </div>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === "chats" ? (
            <div className="p-4 space-y-2">
              {chatHistory &&
                chatHistory.map((chat) => (
                  <button
                    key={chat.session_id}
                    onClick={() => loadConversation(chat.session_id)}
                    className={`w-full text-left p-3 rounded-lg hover:bg-gray-50 ${
                      currentConversationId === chat.session_id
                        ? "bg-blue-50"
                        : ""
                    }`}
                  >
                    <div className="font-medium text-gray-900">
                      {chat.title}
                    </div>
                    <div className="text-sm text-gray-500 truncate">
                      {chat.messages[chat.messages.length - 1]?.content}
                    </div>
                  </button>
                ))}
            </div>
          ) : (
            <div className="p-4">
              <button
                onClick={() => setShowUploadModal(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 mb-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Upload className="w-5 h-5" />
                Upload Document
              </button>
              {documentsList && (
                <DocumentList
                  documents={documentsList}
                  onSelect={setSelectedDocument}
                  selectedId={selectedDocument}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Document Selection */}
        <div className="bg-white border-b border-gray-200 p-4">
          <select
            value={selectedDocument || ""}
            onChange={(e) => setSelectedDocument(e.target.value || undefined)}
            className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">General Chat</option>
            {documentsList &&
              documentsList.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.filename}
                </option>
              ))}
          </select>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <ChatMessage key={index} message={message} />
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-4 bg-white">
          <div className="max-w-4xl mx-auto flex gap-4">
            <div className="flex-1 flex items-center gap-4 bg-white rounded-lg border border-gray-300 px-4">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder={`${
                  selectedDocument
                    ? "Ask questions about the selected document..."
                    : "Send a message..."
                }`}
                className="flex-1 py-3 bg-transparent focus:outline-none"
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim()}
                className="p-2 text-blue-500 hover:text-blue-700 disabled:text-gray-300"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-lg font-semibold mb-4">Upload Document</h2>
            <FileUpload
              onUpload={async (file) => uploadDocumentMutation.mutate(file)}
            />
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HomePage;
