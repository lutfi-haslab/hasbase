import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useMobileContext } from '@/context/mobileProvider';
import { Languages, MessageCircle, RefreshCw, Send } from 'lucide-react';
import React, { useEffect } from 'react';
import LayoutMobile from './LayoutMobile';
import CustomSelect from '@/components/CustomSelect';


const languages = [
    { value: 'id', label: 'Indonesian' },
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
    { value: 'zh', label: 'Chinese' },
    { value: 'ja', label: 'Japanese' },
    { value: 'ko', label: 'Korean' }
];

const Translator = () => {
    const {
        translationMessages,
        translationStreamingContent,
        translationLoading,
        translationInput,
        chatMode,
        fromLang,
        toLang,
        setInput,
        handleTranslationSubmit,
        clearTranslationMessages,
        setChatMode,
        setFromLang,
        setToLang,
        setTranslationInput,
        handleTranslate,
        renderMessageContent
    } = useMobileContext();
    const messagesEndRef = React.useRef<HTMLDivElement>(null);
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);


    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [translationMessages, translationStreamingContent]);

    const handleTextareaInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
        const textarea = e.currentTarget;
        textarea.style.height = 'auto';
        const newHeight = Math.min(textarea.scrollHeight, 5 * 24); // 5 rows maximum
        textarea.style.height = `${newHeight}px`;
    };

    return (
        <LayoutMobile titleHeader="Translator" backButton={() => {
            clearTranslationMessages();
            history.back();
        }}>
            <div className="flex flex-col h-screen bg-gray-50">
                {/* Language Selection and Mode Toggle */}
                <Card className="mx-4 mt-4 p-4 shadow-lg">
                    <div className="flex flex-col space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Languages className="w-5 h-5 text-blue-500" />
                                <span className="font-medium text-gray-800">Language Selection</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <MessageCircle className="w-4 h-4 text-blue-500" />
                                <span className="text-sm text-gray-600">Chat Mode</span>
                                <Switch
                                    checked={chatMode}
                                    onCheckedChange={() => setChatMode(!chatMode)}
                                />
                            </div>
                        </div>

                        <div className="flex space-x-4">
                            <CustomSelect
                                value={fromLang}
                                onChange={setFromLang}
                                options={languages}
                                className='w-full'
                            />

                            <CustomSelect
                                value={toLang}
                                onChange={setToLang}
                                options={languages}
                                className='w-full'
                            />

                        </div>
                    </div>
                </Card>

                {chatMode ? (
                    <>
                        {/* Chat Messages Container */}
                        <div className="flex-1 overflow-y-auto px-4 py-4 pb-32">
                            {translationMessages.slice(1).map((message, index) => (
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

                            {translationStreamingContent && (
                                <div className="flex justify-start mb-4">
                                    <div className="max-w-[80%] rounded-2xl p-3 bg-white text-gray-800 shadow-md">
                                        <p className="text-sm whitespace-pre-wrap">{translationStreamingContent}</p>
                                    </div>
                                </div>
                            )}

                            {translationLoading && !translationStreamingContent && (
                                <div className="flex justify-center">
                                    <div className="animate-pulse text-gray-400">Thinking...</div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Fixed Chat Input */}
                        <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white p-4 shadow-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <button
                                    onClick={clearTranslationMessages}
                                    className="text-sm flex items-center gap-1 text-gray-600 hover:text-gray-800"
                                >
                                    <RefreshCw size={16} />
                                    New Chat
                                </button>
                            </div>

                            <form onSubmit={(e) => handleTranslationSubmit(e, fromLang, toLang)} className="flex gap-2">
                                <textarea
                                    ref={textareaRef}
                                    value={translationInput}
                                    onChange={(e) => setTranslationInput(e.target.value)}
                                    onInput={handleTextareaInput}
                                    placeholder="Type your message..."
                                    className="flex-1 rounded-xl border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-gray-50"
                                    style={{
                                        maxHeight: '120px',
                                    }}
                                    rows={1}
                                    disabled={translationLoading}
                                />
                                <button
                                    type="submit"
                                    disabled={translationLoading || !translationInput.trim()}
                                    className="rounded-xl bg-blue-500 px-4 py-2 text-white disabled:opacity-50 hover:bg-blue-600 transition-colors shadow-md"
                                >
                                    <Send size={20} />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <>
                        {/* Translation Results */}
                        <div className="flex-1 overflow-y-auto p-4 pb-32">
                            {translationLoading ? (
                                <div className="flex items-center justify-center h-full">
                                    <div className="text-gray-500 animate-pulse">Translating...</div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <Card className="p-4 shadow-md">
                                        <div className="min-h-[8rem]">
                                            {translationMessages.length > 1 && translationMessages[translationMessages.length - 1].role === 'assistant' && (
                                                <div className="text-gray-800">
                                                    {renderMessageContent(translationMessages[translationMessages.length - 1].content)}
                                                </div>
                                            )}
                                        </div>
                                    </Card>
                                    {translationStreamingContent && (
                                        <div className="bg-white p-4 rounded-xl shadow-md mr-auto max-w-[80%]">
                                            <div className="text-gray-800">{translationStreamingContent}</div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Fixed Translation Input */}
                        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-lg">
                            <textarea
                                value={translationInput}
                                onChange={(e) => setTranslationInput(e.target.value)}
                                className="w-full p-3 border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                                placeholder="Enter text to translate..."
                                rows={3}
                            />
                            <div className='flex items-center gap-3'>
                                <RefreshCw size={24} />
                                <Button
                                    onClick={handleTranslate}
                                    disabled={translationLoading || !translationInput.trim()}
                                    className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors shadow-md"
                                >
                                    {translationLoading ? 'Translating...' : 'Translate'}
                                </Button>
                            </div>

                        </div>
                    </>
                )}
            </div>
        </LayoutMobile>
    );
};

export default Translator;