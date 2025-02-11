import CustomSelect from '@/components/CustomSelect';
import { useMobileContext } from '@/context/mobileProvider';
import { RefreshCw, Send } from 'lucide-react';
import React, { useEffect } from 'react';
import LayoutMobile from './LayoutMobile';



const LearnAi = () => {
    const {
        learningMessages,
        learningStreamingContent,
        learningLoading,
        learningInput,
        topic,
        handleLearningSubmit,
        clearLearningMessages,
        setTopic,
        setLearningInput,
    } = useMobileContext();
    const messagesEndRef = React.useRef<HTMLDivElement>(null);
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    const topicOptions = [
        { value: 'english', label: 'English' },
        { value: 'coding', label: 'Coding' },
        { value: 'biology', label: 'Biology' },
        { value: 'physics', label: 'Physics' },
    ];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [learningMessages, learningStreamingContent]);

    const handleTextareaInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
        const textarea = e.currentTarget;
        textarea.style.height = 'auto';
        const newHeight = Math.min(textarea.scrollHeight, 5 * 24); // 5 rows maximum
        textarea.style.height = `${newHeight}px`;
    };

    return (
        <LayoutMobile titleHeader="Learning with AI" backButton={() => {
            clearLearningMessages();
            history.back();
        }}>
            {/* Chat Messages Container */}
            <div className="flex-1 overflow-y-auto px-4 py-4 pb-32">
                {learningMessages.slice(1).map((message, index) => (
                    <div
                        key={index}
                        className={`mb-4 ${message.role === 'user' ? 'flex justify-end' : 'flex justify-start'}`}
                    >
                        <div
                            className={`max-w-[80%] rounded-2xl p-3 ${message.role === 'user'
                                ? 'bg-blue-500 text-white shadow-md'
                                : 'bg-white text-gray-800 shadow-md'
                                }`}
                        >
                            <p className="text-sm whitespace-pre-wrap">
                                {message.content as string}
                            </p>
                        </div>
                    </div>
                ))}

                {learningStreamingContent && (
                    <div className="flex justify-start mb-4">
                        <div className="max-w-[80%] rounded-2xl p-3 bg-white text-gray-800 shadow-md">
                            <p className="text-sm whitespace-pre-wrap">{learningStreamingContent}</p>
                        </div>
                    </div>
                )}

                {learningLoading && !learningStreamingContent && (
                    <div className="flex justify-center">
                        <div className="animate-pulse text-gray-400">Thinking...</div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Fixed Chat Input */}
            <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white p-4 shadow-lg">
                <div className="grid grid-cols-2 gap-2 mb-2">
                    <button
                        onClick={clearLearningMessages}
                        className="text-sm flex items-center gap-1 text-gray-600 hover:text-gray-800"
                    >
                        <RefreshCw size={16} />
                        New Chat
                    </button>
                    <CustomSelect
                        value={topic}
                        onChange={(val) => {
                            clearLearningMessages();
                            setTopic(val);
                        }}
                        options={topicOptions}
                    />
                </div>

                <form onSubmit={(e) => handleLearningSubmit(e)} className="flex gap-2">
                    <textarea
                        ref={textareaRef}
                        value={learningInput}
                        onChange={(e) => setLearningInput(e.target.value)}
                        onInput={handleTextareaInput}
                        placeholder="Type your message..."
                        className="flex-1 rounded-xl border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-gray-50"
                        style={{
                            maxHeight: '120px',
                        }}
                        rows={1}
                        disabled={learningLoading}
                    />
                    <button
                        type="submit"
                        disabled={learningLoading || !learningInput.trim()}
                        className="rounded-xl bg-blue-500 px-4 py-2 text-white disabled:opacity-50 hover:bg-blue-600 transition-colors shadow-md"
                    >
                        <Send size={20} />
                    </button>
                </form>
            </div>
        </LayoutMobile>
    );
};

export default LearnAi;