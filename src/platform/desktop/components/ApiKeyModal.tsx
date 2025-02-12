import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { ModelConfig } from "../lib/indexdb";

const ApiKeyModal = ({
  isOpen,
  onClose,
  predefinedModels,
  customModels,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  predefinedModels: ModelConfig[];
  customModels: ModelConfig[];
  onSave: (apiKey: { [key: string]: string }) => void;
}) => {
  const [apiKeys, setApiKeys] = useState({});

  useEffect(() => {
    // Load saved API keys from localStorage
    const savedKeys = localStorage.getItem("modelApiKeys");
    if (savedKeys) {
      setApiKeys(JSON.parse(savedKeys));
    }
  }, []);

  const handleSave = () => {
    // Save to localStorage
    localStorage.setItem("modelApiKeys", JSON.stringify(apiKeys));
    onSave(apiKeys);
    onClose();
  };

  const handleKeyChange = (provider: string, value: string) => {
    setApiKeys((prev) => ({
      ...prev,
      [provider]: value,
    }));
  };

  if (!isOpen) return null;

  // Get unique providers from predefined models
  const uniqueProviders = [
    ...new Set([...predefinedModels, ...customModels].map((model) => model.provider)),
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Configure API Keys</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {uniqueProviders.map((provider) => (
            <div key={provider} className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {provider.charAt(0).toUpperCase() + provider.slice(1)} API Key
              </label>
              <input
                type="password"
                value={(apiKeys as Record<string, string>)[provider] || ""}
                onChange={(e) => handleKeyChange(provider, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={`Enter ${provider} API key`}
              />
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Save Keys
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;
