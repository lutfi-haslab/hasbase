import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  FileText,
  History,
  Key,
  KeyRound,
  Logs,
  Plus,
  PowerIcon,
  Send,
  Settings,
  Upload,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ChatMessage } from "../components/ChatMessage";
import { DocumentList } from "../components/DocumentList";
import { FileUpload } from "../components/FileUpload";
import * as api from "../lib/api";
import { useChatStore } from "../store/chat";
import { ChatMessage as ChatMessageType, ChatResponse } from "../types/api";
import { ModelConfig, modelConfigService } from "../lib/indexdb";
import { ModelConfigModal } from "../components/ModelConfigModal";
import React from "react";
import ApiKeyModal from "../components/ApiKeyModal";
import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";

function HomePage() {
  const {
    messages,
    documents,
    selectedDocument,
    currentConversationId,
    inputValue,
    showUploadModal,
    activeTab,
    selectedModelConfig,
    setSelectedModelConfig,
    addCustomModel,
    showModelModal,
    setShowModelModal,
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
  const [customModels, setCustomModels] = useState<ModelConfig[]>([]);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [showLogger, setShowLogger] = useState(false);
  const [status, setStatus] = useState({ connected: false, info: "" });
  const [logs, setLogs] = useState(
    "[ui] Listening for sidecar & network logs..."
  );

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

  useEffect(() => {
    const loadModelConfigs = async () => {
      const configs = await modelConfigService.getAllModelConfigs();
      // configs.forEach(addCustomModel);
      console.log(configs);
      setCustomModels(configs);
    };
    loadModelConfigs();
  }, []);

  useEffect(() => {
    if (customModels.length > 0 && !selectedModelConfig) {
      setSelectedModelConfig(customModels[0]); // Default to the first custom model
    }
  }, [customModels]);

  // Predefined models
  const predefinedModels: ModelConfig[] = [
    { provider: "openai", model: "gpt-4o", apiKey: "" },
    { provider: "openai", model: "gpt-4o-latest", apiKey: "" },
    { provider: "openai", model: "gpt-4o-mini", apiKey: "" },
  ];

  const handleModelSave = async (config: ModelConfig) => {
    await modelConfigService.saveModelConfig(config);
    addCustomModel(config);
    setCustomModels(await modelConfigService.getAllModelConfigs());
  };

  // Mutations
  const sendMessageMutation = useMutation({
    mutationFn: async ({
      message,
      conversationId,
    }: {
      message: string;
      conversationId?: string;
    }) => {
      if (!selectedModelConfig) {
        throw new Error("Please select a model configuration");
      }

      const { model, apiKey, provider } = selectedModelConfig;

      if (selectedDocument) {
        return api.chatWithDocument(
          selectedDocument,
          message,
          undefined,
          conversationId,
          model,
          apiKey,
          provider
        );
      } else {
        return api.sendChatMessage(
          message,
          conversationId,
          model,
          apiKey,
          provider
        );
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
    mutationFn: async ({ file, apiKey }: { file: File; apiKey: string }) =>
      await api.uploadDocument(file, apiKey),
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

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (!value) {
      setSelectedModelConfig(undefined);
      return;
    }

    const firstColonIndex = value.indexOf(":");
    if (firstColonIndex === -1) {
      console.error("Invalid model format:", value);
      return;
    }

    const provider = value.substring(0, firstColonIndex);
    const model = value.substring(firstColonIndex + 1);

    // Get the API key from localStorage
    const savedKeys = JSON.parse(localStorage.getItem("modelApiKeys") || "{}");
    const apiKey = savedKeys[provider] || "";

    // Find the model in predefinedModels or customModels
    let config = [...predefinedModels, ...customModels].find(
      (c) => c.provider === provider && c.model === model
    );

    if (config) {
      // Include the API key in the config
      config = {
        ...config,
        apiKey,
      };
      setSelectedModelConfig(config);
      console.log("Model selected:", config);
    } else {
      console.error("Model not found:", value);
    }
  };

  const handleApiKeySave = (apiKeys: { [key: string]: string }) => {
    // Update the predefined models with their API keys
    const updatedPredefinedModels = predefinedModels.map((model) => ({
      ...model,
      apiKey: apiKeys[model.provider] || "",
    }));
    // You might want to store this somewhere or update your state management
    console.log("Updated models with API keys:", updatedPredefinedModels);
  };

  const initSidecarListeners = async () => {
    // Listen for stdout lines from the sidecar
    const unlistenStdout = await listen("sidecar-stdout", (event) => {
      console.log("Sidecar stdout:", event.payload);
      if (`${event.payload}`.length > 0 && event.payload !== "\r\n")
        setLogs((prev) => (prev += `\n${event.payload}`));
    });

    // Listen for stderr lines from the sidecar
    const unlistenStderr = await listen("sidecar-stderr", (event) => {
      console.error("Sidecar stderr:", event.payload);
      if (`${event.payload}`.length > 0 && event.payload !== "\r\n")
        setLogs((prev) => (prev += `\n${event.payload}`));
    });

    // Cleanup listeners when not needed
    return () => {
      unlistenStdout();
      unlistenStderr();
    };
  };

  // Start listening for server logs
  useEffect(() => {
    initSidecarListeners();
  }, []);

  return (
    <React.Fragment>
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
          <div className="bg-white border-b border-gray-200 p-4 flex justify-between items-center">
            <select
              value={selectedDocument || ""}
              onChange={(e) => setSelectedDocument(e.target.value || undefined)}
              className="max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">General Chat</option>
              {documentsList &&
                documentsList.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.filename}
                  </option>
                ))}
            </select>
            <div className="flex items-center gap-2">
              <select
                value={
                  selectedModelConfig
                    ? `${selectedModelConfig.provider}:${selectedModelConfig.model}`
                    : ""
                }
                onChange={handleModelChange}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Model</option>
                <optgroup label="Predefined Models">
                  {predefinedModels.map((config) => (
                    <option
                      key={`${config.provider}:${config.model}`}
                      value={`${config.provider}:${config.model}`}
                    >
                      {`${config.provider} - ${config.model}`}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Custom Models">
                  {customModels.map((config) => (
                    <option
                      key={`${config.provider}:${config.model}`}
                      value={`${config.provider}:${config.model}`}
                    >
                      {`${config.provider} - ${config.model}`}
                    </option>
                  ))}
                </optgroup>
              </select>

              <button
                onClick={() => setShowApiKeyModal(true)}
                className="p-2 text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100"
              >
                <KeyRound className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowModelModal(true)}
                className="p-2 text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100"
              >
                <Settings className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowLogger(true)}
                className="p-2 text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100"
              >
                <Logs className="w-5 h-5" />
              </button>
            </div>
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
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
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
        {showLogger && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Configure API Keys</h2>
                <button
                  onClick={() => setShowLogger(false)}
                  className="p-1 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <code className="relative flex max-w-[1200px] max-h-96 font-mono font-bold border dark:border-neutral-800 border-gray-300 rounded-lg backdrop-blur-2xl dark:bg-zinc-800/30 bg-neutral-400/30 p-4 mt-4 mb-4 whitespace-pre-wrap overflow-y-auto">
                {logs}
              </code>
            </div>
          </div>
        )}

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="text-lg font-semibold mb-4">Upload Document</h2>
              <FileUpload
                onUpload={async (file) =>
                  uploadDocumentMutation.mutate({
                    file,
                    apiKey: selectedModelConfig?.apiKey as string,
                  })
                }
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
      {showModelModal && (
        <ModelConfigModal
          onClose={() => setShowModelModal(false)}
          onSave={handleModelSave}
        />
      )}
      {showApiKeyModal && (
        <ApiKeyModal
          isOpen={showApiKeyModal}
          onClose={() => setShowApiKeyModal(false)}
          predefinedModels={predefinedModels}
          customModels={customModels}
          onSave={handleApiKeySave}
        />
      )}
    </React.Fragment>
  );
}

export default HomePage;
