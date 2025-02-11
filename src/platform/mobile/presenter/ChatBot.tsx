import { useMobileContext } from '@/context/mobileProvider';
import { MessageContent } from '@langchain/core/messages';
import { RefreshCw, Send } from 'lucide-react';
import React, { useEffect } from 'react';
import LayoutMobile from './LayoutMobile';

interface Message {
    role: 'system' | 'user' | 'assistant' | string;
    content: string | MessageContent;
}


const SYSTEM_PROMPT = "You are a helpful assistant specializing in language translation and grammar explanation.";
const TRANSLATION_PROMPT = "You are a precise translator. Provide only the direct translation without any additional explanations or commentary unless specifically requested.";
const LEARNING_PROMPT = "You are a helpful assistant and become a personal teacher to help students learn a new topic. you will teach the student by providing explanations, examples, and exercises to reinforce learning. You will also provide feedback to the student to help them understand concepts better. you are good for this topics, including English, coding, biology, physics. show explanation maximal in 150 words.";


const ChatBot = () => {
    const {
        messages,
        streamingContent,
        loading,
        input,
        setInput,
        handleSubmit,
        clearMessages,
    } = useMobileContext();
    const messagesEndRef = React.useRef<HTMLDivElement>(null);
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);


    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, streamingContent]);

    const handleTextareaInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
        const textarea = e.currentTarget;
        textarea.style.height = 'auto';
        const newHeight = Math.min(textarea.scrollHeight, 5 * 24); // 5 rows maximum
        textarea.style.height = `${newHeight}px`;
    };

    return (
        <LayoutMobile titleHeader='Chat' backButton={() => {
            clearMessages();
            history.back();
        }}>
            <div className="flex flex-col h-screen max-h-screen">
                {/* Main container with flex-1 to take remaining space */}
                <div className="flex-1 flex flex-col min-h-0"> {/* min-h-0 is crucial for nested flex containers */}
                    {/* Chat Messages Container */}
                    <div className="flex-1 overflow-y-auto px-4 py-4 bg-gray-50 mt-[15%]">
                        {messages.slice(1).map((message, index) => (
                            <div
                                key={index}
                                className={`mb-4 ${message.role === 'user'
                                    ? 'flex justify-end'
                                    : 'flex justify-start'
                                    }`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-lg p-3 ${message.role === 'user'
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-white text-gray-800 shadow-sm'
                                        }`}
                                >
                                    <p className="text-sm whitespace-pre-wrap">
                                        {message.content as string}
                                    </p>
                                </div>
                            </div>
                        ))}

                        {/* Streaming Content */}
                        {streamingContent && (
                            <div className="flex justify-start mb-4">
                                <div className="max-w-[80%] rounded-lg p-3 bg-white text-gray-800 shadow-sm">
                                    <p className="text-sm whitespace-pre-wrap">
                                        {streamingContent}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Loading indicator */}
                        {loading && !streamingContent && (
                            <div className="flex justify-center">
                                <div className="animate-pulse text-gray-400">
                                    Thinking...
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Controls Container */}
                    <div className="border-t border-gray-200 bg-white p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <button
                                onClick={() => clearMessages()}
                                className="text-sm flex items-center gap-1 text-gray-600 hover:text-gray-800"
                            >
                                <RefreshCw size={16} />
                                New Chat
                            </button>
                            {/* <label className="flex items-center ml-auto">
                                <span className="text-sm text-gray-600 mr-2">Session Mode</span>
                                <input
                                    type="checkbox"
                                    checked={isSessionMode}
                                    onChange={toggleSessionMode}
                                    className="form-checkbox h-4 w-4 text-blue-500"
                                />
                            </label> */}
                        </div>

                        {/* Input Form */}
                        <form onSubmit={handleSubmit} className="flex gap-2">
                            <textarea
                                ref={textareaRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onInput={handleTextareaInput}
                                placeholder="Type your message..."
                                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                style={{
                                    maxHeight: '120px', // 5 rows × 24px
                                }}
                                rows={1}
                                disabled={loading}
                            />
                            <button
                                type="submit"
                                disabled={loading || !input.trim()}
                                className="rounded-lg bg-blue-500 px-4 py-2 text-white disabled:opacity-50"
                            >
                                <Send size={20} />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </LayoutMobile>
    );
};

export default ChatBot;