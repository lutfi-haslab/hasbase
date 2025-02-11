import { ChatMessage, MessageContent } from '@langchain/core/messages';
import { ChatOpenAI } from '@langchain/openai';
import { BaseChatModel } from 'node_modules/@langchain/core/dist/language_models/chat_models';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface Message {
    role: 'system' | 'user' | 'assistant' | string;
    content: string | MessageContent;
}

interface TranslationMessage {
    role: 'system' | 'user' | 'assistant' | string;
    content: string;
    fromLang: string;
    toLang: string;
}

interface LearningMessage {
    role: 'system' | 'user' | 'assistant' | string;
    content: string;
    topic: string;
}


interface MobileContextType {
    // Chat related states
    messages: Message[];

    // Translation related states
    translationMessages: TranslationMessage[];
    translationInput: string;
    translationLoading: boolean;
    translationStreamingContent: string;
    fromLang: string;
    toLang: string;
    chatMode: boolean;

    // Learning related states
    learningMessages: LearningMessage[];
    learningInput: string;
    learningLoading: boolean;
    learningStreamingContent: string;
    topic: string;


    // Shared states
    input: string;
    loading: boolean;
    streamingContent: string;
    llm: BaseChatModel | null;

    // ChatBot Methods
    clearMessages: () => void;
    handleSubmit: (e: React.FormEvent) => Promise<void>;
    setInput: (input: string) => void;

    // Translation Methods
    clearTranslationMessages: () => void;
    handleTranslationSubmit: (e: React.FormEvent, fromLang: string, toLang: string) => Promise<void>;
    handleTranslate: (e: React.FormEvent) => Promise<void>;
    renderMessageContent: (content: any) => string;
    setFromLang: (lang: string) => void;
    setToLang: (lang: string) => void;
    setChatMode: (mode: boolean) => void;
    setTranslationInput: (input: string) => void;

    // Learning Methods
    clearLearningMessages: () => void;
    handleLearningSubmit: (e: React.FormEvent) => Promise<void>;
    setTopic: (topic: string) => void;
    setLearningInput: (input: string) => void;
}


const SYSTEM_PROMPT = "You are a helpful assistant specializing in language translation and grammar explanation.";
const TRANSLATION_PROMPT = "You are a precise translator. Provide only the direct translation without any additional explanations or commentary unless specifically requested.";
const LEARNING_PROMPT = "You are a helpful assistant and become a personal teacher to help students learn a new topic. you will teach the student by providing explanations, examples, and exercises to reinforce learning. You will also provide feedback to the student to help them understand concepts better. you are good for this topics, including English, coding, biology, physics. show explanation maximal in 150 words.";



const MobileContext = createContext<MobileContextType | undefined>(undefined);

export const MobileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // ChatBot States
    const [messages, setMessages] = useState<Message[]>([
        { role: 'system', content: SYSTEM_PROMPT }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [streamingContent, setStreamingContent] = useState<string>('');


    // Translation States
    const [translationMessages, setTranslationMessages] = useState<TranslationMessage[]>([
        { role: 'system', content: TRANSLATION_PROMPT, fromLang: 'id', toLang: 'en' }
    ]);
    const [translationInput, setTranslationInput] = useState('');
    const [translationLoading, setTranslationLoading] = useState(false);
    const [translationStreamingContent, setTranslationStreamingContent] = useState('');
    const [fromLang, setFromLang] = React.useState('id');
    const [toLang, setToLang] = React.useState('en');
    const [chatMode, setChatMode] = React.useState(false);


    // Learning states
    const [learningMessages, setLearningMessages] = useState<LearningMessage[]>([]);
    const [learningInput, setLearningInput] = useState('');
    const [learningLoading, setLearningLoading] = useState(false);
    const [learningStreamingContent, setLearningStreamingContent] = useState('');
    const [topic, setTopic] = useState<string>('english');


    const llm = new ChatOpenAI({
        temperature: 0.7,
        topP: 1,
        streaming: true,
        openAIApiKey: import.meta.env.VITE_OPENAI_API_KEY,
        modelName: "chatgpt-4o-latest",
    });


    // ChatBot Methods

    const clearMessages = () => {
        setMessages([]);
        setStreamingContent('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !llm) return;

        setLoading(true);
        setStreamingContent('');

        try {

            const newMessages = [...messages, { role: 'user', content: input }];
            setMessages(newMessages);

            const chatMessages = newMessages.map(msg => ({
                role: msg.role,
                content: msg.content
            })) as ChatMessage[];

            let fullResponse = '';
            const stream = await llm.stream(chatMessages);

            for await (const chunk of stream) {
                if (chunk.content) {
                    fullResponse += chunk.content;
                    setStreamingContent(prev => prev + chunk.content);
                }
            }

            const updatedMessages = [...newMessages, {
                role: 'assistant',
                content: fullResponse
            }];

            setMessages(updatedMessages);
            setStreamingContent('');

        } catch (error) {
            console.error('Translation error:', error);
        } finally {
            setLoading(false);
            setInput('');
            setStreamingContent('');
        }
    };


    // Translation Methods
    const clearTranslationMessages = () => {
        setTranslationMessages([]);
        setTranslationStreamingContent('');
    };

    const handleTranslationSubmit = async (e: React.FormEvent, fromLang: string, toLang: string) => {
        e.preventDefault();
        if (!translationInput.trim() || !llm) return;

        setTranslationLoading(true);
        setTranslationStreamingContent('');

        try {
            const translationPrompt = `Translate the following text from ${fromLang} to ${toLang}. Provide ONLY the translation without any explanations:\n\n${translationInput}`;

            const newMessages = [...translationMessages, { role: 'user', content: translationPrompt, fromLang, toLang }];
            setTranslationMessages(newMessages);

            const chatMessages = newMessages.map(msg => ({
                role: msg.role,
                content: msg.content
            })) as ChatMessage[];

            let fullResponse = '';
            const stream = await llm.stream(chatMessages);

            for await (const chunk of stream) {
                if (chunk.content) {
                    fullResponse += chunk.content;
                    setTranslationStreamingContent(prev => prev + chunk.content);
                }
            }

            const updatedMessages = [...newMessages, {
                role: 'assistant',
                content: fullResponse,
                fromLang,
                toLang
            }];

            setTranslationMessages(updatedMessages);
            setTranslationStreamingContent('');

        } catch (error) {
            console.error('Translation error:', error);
        } finally {
            setTranslationLoading(false);
            setTranslationInput('');
            setTranslationStreamingContent('');
        }
    };

    const handleTranslate = async (e: React.FormEvent) => {
        if (!translationInput.trim()) return;
        await handleTranslationSubmit(e, fromLang, toLang);
    };

    const renderMessageContent = (content: any): string => {
        if (typeof content === 'string') return content;
        if (Array.isArray(content)) return content.map(item => item.text).join('');
        return '';
    };


    // Learning Methods
    const clearLearningMessages = () => {
        setLearningMessages([]);
        setLearningStreamingContent('');
    };

    const handleLearningSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!learningInput.trim() || !llm) return;

        setLearningLoading(true);
        setLearningStreamingContent('');

        try {
            const LEARNING_PROMPT = `You are a helpful assistant and become a personal teacher to help students learn a new topic. you will teach the student by providing explanations, examples, and exercises to reinforce learning. You will also provide feedback to the student to help them understand concepts better. you are good for this topics, including English, coding, biology, physics. show explanation maximal in 150 words. For this session, i would like to learn topic ${topic}`;
            const newMessages = [{ role: 'system', content: LEARNING_PROMPT, topic }, ...learningMessages, { role: 'user', content: learningInput, topic }];
            setLearningMessages(newMessages);

            const chatMessages = newMessages.map(msg => ({
                role: msg.role,
                content: msg.content
            })) as ChatMessage[];

            let fullResponse = '';
            const stream = await llm.stream(chatMessages);

            for await (const chunk of stream) {
                if (chunk.content) {
                    fullResponse += chunk.content;
                    setLearningStreamingContent(prev => prev + chunk.content);
                }
            }

            const updatedMessages = [...newMessages, {
                role: 'assistant',
                content: fullResponse,
                topic,
            }];

            setLearningMessages(updatedMessages);
            setLearningStreamingContent('');

        } catch (error) {
            console.error('Translation error:', error);
        } finally {
            setLearningLoading(false);
            setLearningInput('');
            setLearningStreamingContent('');
        }
    };


    return (
        <MobileContext.Provider value={{
            // Chat states
            messages,

            // Translation states
            translationMessages,
            translationInput,
            translationLoading,
            translationStreamingContent,
            fromLang,
            toLang,
            chatMode,
            // Learning states
            learningMessages,
            learningInput,
            learningLoading,
            learningStreamingContent,
            topic,

            // Shared states
            input,
            loading,
            streamingContent,
            llm,

            // ChatBot Methods
            clearMessages,
            handleSubmit,
            setInput,

            // Translation Methods
            clearTranslationMessages,
            handleTranslationSubmit,
            handleTranslate,
            renderMessageContent,
            setFromLang,
            setToLang,
            setChatMode,
            setTranslationInput,

            // Learning Methods
            clearLearningMessages,
            handleLearningSubmit,
            setTopic,
            setLearningInput
        }}>
            {children}
        </MobileContext.Provider>
    );
};

export const useMobileContext = (): MobileContextType => {
    const context = useContext(MobileContext);
    if (!context) {
        throw new Error('useMobileContext must be used within a MobileProvider');
    }
    return context;
};
