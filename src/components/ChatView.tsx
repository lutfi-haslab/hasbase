import { useAiContext } from '@/context/AiProvider';
import { useEffect, useRef, useCallback, useState } from 'react';
import { Send, Loader2, Copy, Check } from 'lucide-react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const ChatView = ({ chatId }: { chatId?: string }) => {
    const {
        messages,
        loading,
        input,
        streamingContent,
        setInput,
        handleSubmit,
        switchChat
    } = useAiContext();

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    useEffect(() => {
        switchChat(chatId as string);
    }, [chatId]);

    const CodeBlock = ({ children, className }: { children: any; className?: string }) => {
        const [copied, setCopied] = useState(false);
        const code = Array.isArray(children)
            ? children.join('')
            : children?.toString() || '';

        const handleCopy = async () => {
            try {
                await navigator.clipboard.writeText(code);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch (err) {
                console.error('Failed to copy text:', err);
            }
        };

        return (
            <div className="relative group">
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg my-3 overflow-x-auto font-mono text-sm leading-6">
                    <div className="absolute right-2 top-2">
                        <button
                            onClick={handleCopy}
                            className="p-2 rounded-md bg-gray-800 hover:bg-gray-700 transition-colors duration-200"
                            title="Copy code"
                        >
                            {copied ? (
                                <Check className="w-4 h-4 text-green-500" />
                            ) : (
                                <Copy className="w-4 h-4 text-gray-400 group-hover:text-white" />
                            )}
                        </button>
                    </div>
                    <code className={className}>{code}</code>
                </pre>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-[82vh] bg-gray-50">
            <div className="flex-1 overflow-y-auto bg-white rounded-lg shadow-lg p-6 space-y-6">
                {messages.slice(1).map((message, index) => (
                    <div
                        key={index}
                        className={`flex ${message.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
                    >
                        <div
                            className={`max-w-[80%] rounded-lg p-4 ${message.role === 'assistant'
                                    ? 'bg-gray-100 text-gray-800'
                                    : 'bg-blue-500 text-white'
                                }`}
                        >
                            <div className="mb-1 text-sm font-semibold">
                                {message.role === 'assistant' ? 'AI Assistant' : 'You'}
                            </div>
                            <div className="text-sm whitespace-pre-wrap">
                                <Markdown
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                        code({ className, children }) {
                                            return <CodeBlock className={className}>{children}</CodeBlock>;
                                        }
                                    }}
                                >
                                    {message.content.toString()}
                                </Markdown>
                            </div>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="max-w-[80%] bg-gray-100 rounded-lg p-4 text-gray-800">
                            <div className="mb-1 text-sm font-semibold">AI Assistant</div>
                            <div className="text-sm whitespace-pre-wrap">
                                {streamingContent || (
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Thinking...
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="sticky bottom-0 bg-white p-4 shadow-md">
                <form onSubmit={handleSubmit} className="flex gap-3">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="flex-1 p-4 bg-white border border-gray-200 rounded-lg shadow-sm 
                                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                                   disabled:bg-gray-50 disabled:cursor-not-allowed"
                        placeholder="Type your message..."
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        className="px-6 py-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 
                                   disabled:bg-gray-400 disabled:cursor-not-allowed
                                   flex items-center gap-2 transition-colors duration-200"
                        disabled={loading || !input.trim()}
                    >
                        <Send className="w-5 h-5" />
                        <span>Send</span>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatView;