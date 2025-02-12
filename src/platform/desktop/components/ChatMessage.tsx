import React from "react";
import { UserCircle, Bot } from "lucide-react";
import { ChatMessage as ChatMessageType } from "../types/api";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";

interface Props {
  message: ChatMessageType;
}

export function ChatMessage({ message }: Props) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex gap-4 p-4 ${
        isUser ? "bg-white" : "bg-gray-50"
      } w-full sm:max-w-md xl:max-w-full md:max-w-2xl`}
    >
      <div className="flex-shrink-0">
        {isUser ? (
          <UserCircle className="w-6 h-6 text-gray-600" />
        ) : (
          <Bot className="w-6 h-6 text-blue-600" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm text-gray-900">
          {isUser ? "You" : "Assistant"}
        </div>
        <div className="mt-1 text-gray-700 prose prose-sm">
          <Markdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || "");
                const language = match ? match[1] : "";

                if (language) {
                  return (
                    <div className="rounded-lg overflow-hidden my-2">
                      <SyntaxHighlighter
                        language={language}
                        style={oneDark}
                        PreTag="div"
                        customStyle={{
                          margin: 0,
                          borderRadius: "0.5rem",
                        }}
                      >
                        {String(children).replace(/\n$/, "")}
                      </SyntaxHighlighter>
                    </div>
                  );
                }

                return (
                  <code
                    className="block bg-gray-100 rounded-lg p-4 whitespace-pre-wrap"
                    {...props}
                  >
                    {children}
                  </code>
                );
              },
            }}
          >
            {message.content}
          </Markdown>
        </div>
      </div>
      <div className="text-xs text-gray-400 flex-shrink-0">
        {new Date(message.timestamp).toLocaleTimeString()}
      </div>
    </div>
  );
}
