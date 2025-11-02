'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import {
    HelpCircle,
    History,
    MessageCircle,
    Plus,
    Search,
    Settings,
    Trash2
} from 'lucide-react';
import { useState } from 'react';

interface Chat {
    id: string;
    title: string;
    preview: string;
    timestamp: Date;
    messageCount?: number;
}

interface ChatbotSidebarProps {
    chats: Chat[];
    selectedChatId: string | null;
    onNewChat: () => void;
    onSelectChat: (chatId: string) => void;
    onDeleteChat: (chatId: string) => void;
    onToggleSettings: () => void;
    showSettings: boolean;
    aiSettings: {
        useThinking: boolean;
        useGoogleSearch: boolean;
        useCodeExecution: boolean;
        thinkingBudget: number;
    };
}

export function ChatbotSidebar({
    chats,
    selectedChatId,
    onNewChat,
    onSelectChat,
    onDeleteChat,
    onToggleSettings,
    showSettings,
    aiSettings
}: ChatbotSidebarProps) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredChats = chats.filter(
        (chat) =>
            chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            chat.preview.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatDate = (date: Date) => {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="flex w-80 flex-col border-r bg-gradient-to-b from-gray-50 to-white dark:from-slate-900 dark:to-slate-800">
            {/* Header */}
            <div className="border-b p-4 space-y-3">
                <Button
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                    onClick={onNewChat}
                >
                    <Plus className="w-4 h-4 mr-2" />
                    New Chat
                </Button>
            </div>

            {/* Chat History Section */}
            <div className="flex min-h-0 flex-col flex-1">
                <div className="px-4 py-3">
                    <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <History className="h-4 w-4 text-gray-500" />
                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                Recent Chats
                            </h3>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                            {chats.length}
                        </Badge>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search chats..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 text-sm"
                        />
                    </div>
                </div>

                <Separator />

                <div className="flex-1 overflow-hidden">
                    <ScrollArea className="h-full">
                        <div className="space-y-1 p-2">
                            {filteredChats.length === 0 ? (
                                <div className="text-center py-8 px-4">
                                    <MessageCircle className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                                    <p className="text-sm text-gray-500">No chats found</p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {searchQuery ? 'Try a different search' : 'Start a new chat to begin'}
                                    </p>
                                </div>
                            ) : (
                                filteredChats.map((chat) => (
                                    <div
                                        key={chat.id}
                                        className={cn(
                                            "group relative rounded-lg transition-all hover:bg-gray-100 dark:hover:bg-slate-700",
                                            selectedChatId === chat.id && "bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800"
                                        )}
                                    >
                                        <Button
                                            variant="ghost"
                                            onClick={() => onSelectChat(chat.id)}
                                            className="h-auto w-full justify-start p-3 text-left hover:bg-transparent"
                                        >
                                            <div className="flex w-full items-start gap-3">
                                                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex-shrink-0">
                                                    <MessageCircle className="h-4 w-4 text-white" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <div className="truncate text-sm font-medium">
                                                            {chat.title}
                                                        </div>
                                                        {chat.messageCount && (
                                                            <Badge variant="outline" className="text-xs ml-2 flex-shrink-0">
                                                                {chat.messageCount}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                        {chat.preview}
                                                    </div>
                                                    <div className="text-xs text-gray-400 mt-1">
                                                        {formatDate(chat.timestamp)}
                                                    </div>
                                                </div>
                                            </div>
                                        </Button>

                                        {/* Delete button - shows on hover */}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDeleteChat(chat.id);
                                            }}
                                            className="absolute right-2 top-2 h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 className="h-3 w-3 text-red-500" />
                                        </Button>
                                    </div>
                                ))
                            )}
                        </div>
                    </ScrollArea>
                </div>
            </div>

            {/* Footer */}
            <Separator />
            <div className="p-3 space-y-2">
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-2"
                    onClick={onToggleSettings}
                >
                    <Settings className="h-4 w-4" />
                    <span className="text-sm">AI Settings</span>
                    {showSettings && (
                        <Badge variant="default" className="ml-auto">
                            Open
                        </Badge>
                    )}
                </Button>

                <Button
                    variant="ghost"
                    className="w-full justify-start gap-2"
                >
                    <HelpCircle className="h-4 w-4" />
                    <span className="text-sm">Help & Support</span>
                </Button>
            </div>
        </div>
    );
}
