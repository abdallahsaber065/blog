'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { ChatbotSettingsPanel } from './ChatbotSettingsPanel';
import { ChatbotSidebar } from './ChatbotSidebar';
import { ChatInterface } from './ChatInterface';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    toolCalls?: number;
    usageMetadata?: {
        promptTokenCount: number;
        candidatesTokenCount: number;
        totalTokenCount: number;
        thinkingTokenCount?: number;
    };
}

interface Chat {
    id: string;
    title: string;
    preview: string;
    timestamp: Date;
    messages: Message[];
    messageCount: number;
}

interface AISettings {
    useThinking: boolean;
    thinkingBudget: number;
    useGoogleSearch: boolean;
    useCodeExecution: boolean;
    useTools: boolean;
}

export default function AIChatbot() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [chats, setChats] = useState<Chat[]>([]);
    const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [selectedTools, setSelectedTools] = useState<string[]>([]);
    const [aiSettings, setAISettings] = useState<AISettings>({
        useThinking: true,
        thinkingBudget: 8192,
        useGoogleSearch: false,
        useCodeExecution: false,
        useTools: true
    });

    // Load chats from localStorage
    useEffect(() => {
        const savedChats = localStorage.getItem('chatbot-chats');
        if (savedChats) {
            try {
                const parsedChats = JSON.parse(savedChats).map((chat: any) => ({
                    ...chat,
                    timestamp: new Date(chat.timestamp),
                    messages: chat.messages.map((msg: any) => ({
                        ...msg,
                        timestamp: new Date(msg.timestamp)
                    }))
                }));
                setChats(parsedChats);
            } catch (error) {
                console.error('Error loading chats:', error);
            }
        }

        const savedSettings = localStorage.getItem('chatbot-settings');
        if (savedSettings) {
            try {
                setAISettings(JSON.parse(savedSettings));
            } catch (error) {
                console.error('Error loading settings:', error);
            }
        }
    }, []);

    // Save chats to localStorage whenever they change
    useEffect(() => {
        if (chats.length > 0) {
            localStorage.setItem('chatbot-chats', JSON.stringify(chats));
        }
    }, [chats]);

    // Save settings to localStorage
    useEffect(() => {
        localStorage.setItem('chatbot-settings', JSON.stringify(aiSettings));
    }, [aiSettings]);

    // Load messages when chat is selected
    useEffect(() => {
        if (selectedChatId) {
            const chat = chats.find(c => c.id === selectedChatId);
            if (chat) {
                setMessages(chat.messages);
            }
        } else {
            setMessages([]);
        }
    }, [selectedChatId, chats]);

    const generateChatTitle = (message: string): string => {
        const words = message.split(' ').slice(0, 6).join(' ');
        return words.length < message.length ? words + '...' : words;
    };

    const generateChatPreview = (message: string): string => {
        return message.slice(0, 50) + (message.length > 50 ? '...' : '');
    };

    const handleNewChat = () => {
        setSelectedChatId(null);
        setMessages([]);
        setInput('');
    };

    const handleSelectChat = (chatId: string) => {
        setSelectedChatId(chatId);
    };

    const handleDeleteChat = (chatId: string) => {
        setChats(prev => prev.filter(chat => chat.id !== chatId));
        if (selectedChatId === chatId) {
            setSelectedChatId(null);
            setMessages([]);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: `msg-${Date.now()}`,
            role: 'user',
            content: input.trim(),
            timestamp: new Date()
        };

        // Add user message
        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);
        setInput('');
        setIsLoading(true);

        try {
            // Prepare message history for API
            const apiMessages = updatedMessages.map(msg => ({
                role: msg.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: msg.content }]
            }));

            // Call chat API
            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(session?.user?.email && { 'Authorization': `Bearer ${session.user.email}` })
                },
                body: JSON.stringify({
                    messages: apiMessages,
                    useTools: aiSettings.useTools,
                    useThinking: aiSettings.useThinking,
                    thinkingBudget: aiSettings.thinkingBudget,
                    useGoogleSearch: aiSettings.useGoogleSearch,
                    useCodeExecution: aiSettings.useCodeExecution
                })
            });

            if (!response.ok) {
                throw new Error('Failed to get response');
            }

            const data = await response.json();

            const assistantMessage: Message = {
                id: `msg-${Date.now()}`,
                role: 'assistant',
                content: data.message,
                timestamp: new Date(),
                toolCalls: data.toolCalls,
                usageMetadata: data.usageMetadata
            };

            const finalMessages = [...updatedMessages, assistantMessage];
            setMessages(finalMessages);

            // Save or update chat
            if (selectedChatId) {
                // Update existing chat
                setChats(prev => prev.map(chat =>
                    chat.id === selectedChatId
                        ? {
                            ...chat,
                            messages: finalMessages,
                            messageCount: finalMessages.length,
                            timestamp: new Date()
                        }
                        : chat
                ));
            } else {
                // Create new chat
                const newChat: Chat = {
                    id: `chat-${Date.now()}`,
                    title: generateChatTitle(userMessage.content),
                    preview: generateChatPreview(userMessage.content),
                    timestamp: new Date(),
                    messages: finalMessages,
                    messageCount: finalMessages.length
                };
                setChats(prev => [newChat, ...prev]);
                setSelectedChatId(newChat.id);
            }

        } catch (error) {
            console.error('Error sending message:', error);
            const errorMessage: Message = {
                id: `msg-${Date.now()}`,
                role: 'assistant',
                content: 'Sorry, I encountered an error processing your request. Please try again.',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClearChat = () => {
        if (selectedChatId && confirm('Are you sure you want to clear this chat?')) {
            handleDeleteChat(selectedChatId);
        }
    };

    const handleCopyMessage = (content: string) => {
        navigator.clipboard.writeText(content);
    };

    const handleFeedback = (messageId: string, feedback: 'up' | 'down') => {
        console.log(`Feedback for message ${messageId}: ${feedback}`);
        // Implement feedback storage if needed
    };

    const handleToggleSettings = () => {
        setShowSettings(!showSettings);
    };

    const handleSettingsChange = (newSettings: AISettings) => {
        setAISettings(newSettings);
    };

    const handleToggleTools = (tools: string[]) => {
        setSelectedTools(tools);
    };

    // Redirect to login if not authenticated (optional)
    useEffect(() => {
        if (status === 'unauthenticated') {
            // Optionally redirect to login
            // router.push('/login');
        }
    }, [status, router]);

    return (
        <div className="flex h-[calc(100vh-4rem)] bg-white dark:bg-slate-900">
            <ChatbotSidebar
                chats={chats}
                selectedChatId={selectedChatId}
                onNewChat={handleNewChat}
                onSelectChat={handleSelectChat}
                onDeleteChat={handleDeleteChat}
                onToggleSettings={handleToggleSettings}
                showSettings={showSettings}
                aiSettings={aiSettings}
            />

            <ChatInterface
                messages={messages}
                input={input}
                handleInputChange={handleInputChange}
                handleSubmit={handleSubmit}
                isLoading={isLoading}
                onCopyMessage={handleCopyMessage}
                onFeedback={handleFeedback}
                onClearChat={handleClearChat}
                showSettings={showSettings}
                aiSettings={aiSettings}
                onToggleTools={handleToggleTools}
                selectedTools={selectedTools}
                onAISettingsChange={handleSettingsChange}
            />

            {showSettings && (
                <ChatbotSettingsPanel
                    settings={aiSettings}
                    onSettingsChange={handleSettingsChange}
                    onClose={() => setShowSettings(false)}
                />
            )}
        </div>
    );
}