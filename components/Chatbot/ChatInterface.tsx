'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Brain,
    Check,
    Code2,
    Copy,
    FileSearch,
    Loader2,
    Mic,
    Paperclip,
    Search,
    Send,
    Settings,
    Sparkles,
    Tag,
    ThumbsDown,
    ThumbsUp,
    TrendingUp,
    Wrench
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';

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

interface AISettings {
    useThinking: boolean;
    thinkingBudget: number;
    useGoogleSearch: boolean;
    useCodeExecution: boolean;
    useTools: boolean;
}

interface ChatInterfaceProps {
    messages: Message[];
    input: string;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    isLoading: boolean;
    onCopyMessage: (content: string) => void;
    onFeedback: (messageId: string, feedback: 'up' | 'down') => void;
    onClearChat: () => void;
    showSettings?: boolean;
    aiSettings: AISettings;
    onToggleTools: (tools: string[]) => void;
    selectedTools: string[];
    onAISettingsChange: (settings: AISettings) => void;
}

const availableTools = [
    { id: 'search', name: 'Search Posts', icon: FileSearch },
    { id: 'outline', name: 'Generate Outline', icon: Sparkles },
    { id: 'stats', name: 'Blog Statistics', icon: TrendingUp },
    { id: 'categories', name: 'Categories', icon: Tag },
    { id: 'tags', name: 'Tags', icon: Tag },
    { id: 'analyze', name: 'Content Analysis', icon: Search },
];

export function ChatInterface({
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    onCopyMessage,
    onFeedback,
    onClearChat,
    showSettings = false,
    aiSettings,
    onToggleTools,
    selectedTools,
    onAISettingsChange
}: ChatInterfaceProps) {
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [showToolsPopover, setShowToolsPopover] = useState(false);

    const handleToolToggle = (toolId: string) => {
        const newTools = selectedTools.includes(toolId)
            ? selectedTools.filter(id => id !== toolId)
            : [...selectedTools, toolId];
        onToggleTools(newTools);
    };

    // Auto scroll to bottom when new messages arrive
    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
    }, [messages]);

    const handleCopy = (content: string, messageId: string) => {
        onCopyMessage(content);
        setCopiedId(messageId);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div className="flex flex-1 flex-col h-full">
            {/* Chat Messages */}
            <ScrollArea className="flex-1 p-6" ref={scrollAreaRef as any}>
                <div className="mx-auto max-w-4xl space-y-6">
                    {messages.length === 0 && (
                        <div className="text-center py-12">
                            <div className="inline-flex p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
                                <Sparkles className="w-8 h-8 text-blue-500" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Start a Conversation</h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                Ask me anything about your blog, content, or get help with writing!
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                                {[
                                    'What are my recent blog posts?',
                                    'Help me generate a blog outline',
                                    'Show me blog statistics',
                                    'Find posts about technology'
                                ].map((suggestion, idx) => (
                                    <Button
                                        key={idx}
                                        variant="outline"
                                        className="h-auto p-4 text-left justify-start"
                                        onClick={() => {
                                            const event = {
                                                preventDefault: () => { },
                                                currentTarget: {
                                                    querySelector: () => ({ value: suggestion })
                                                }
                                            } as any;
                                            handleInputChange({
                                                target: { value: suggestion }
                                            } as React.ChangeEvent<HTMLInputElement>);
                                        }}
                                    >
                                        <span className="text-sm">{suggestion}</span>
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}

                    {messages.map((message) => (
                        <div key={message.id} className="flex gap-4">
                            {message.role === 'user' ? (
                                <>
                                    <Avatar className="w-10 h-10">
                                        <AvatarImage src="/placeholder.svg?height=40&width=40" />
                                        <AvatarFallback className="bg-blue-500 text-white">U</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                                            <p className="text-gray-900 dark:text-gray-100">{message.content}</p>
                                        </div>
                                        <div className="mt-1 text-xs text-gray-500">
                                            {message.timestamp.toLocaleTimeString()}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <Avatar className="w-10 h-10">
                                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                                            AI
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <Card className="border-2">
                                            <CardContent className="p-4">
                                                <div className="prose dark:prose-invert max-w-none">
                                                    <ReactMarkdown
                                                        components={{
                                                            code({ node, inline, className, children, ...props }: any) {
                                                                const match = /language-(\w+)/.exec(className || '');
                                                                return !inline && match ? (
                                                                    <SyntaxHighlighter
                                                                        style={vscDarkPlus}
                                                                        language={match[1]}
                                                                        PreTag="div"
                                                                        {...props}
                                                                    >
                                                                        {String(children).replace(/\n$/, '')}
                                                                    </SyntaxHighlighter>
                                                                ) : (
                                                                    <code className={className} {...props}>
                                                                        {children}
                                                                    </code>
                                                                );
                                                            }
                                                        }}
                                                    >
                                                        {message.content}
                                                    </ReactMarkdown>
                                                </div>

                                                {/* Metadata */}
                                                {(message.toolCalls || message.usageMetadata) && (
                                                    <div className="mt-4 pt-4 border-t flex flex-wrap gap-3 text-xs text-gray-600 dark:text-gray-400">
                                                        {message.toolCalls && message.toolCalls > 0 && (
                                                            <div className="flex items-center gap-1">
                                                                <Settings className="w-3 h-3" />
                                                                <span>{message.toolCalls} tool call{message.toolCalls > 1 ? 's' : ''}</span>
                                                            </div>
                                                        )}
                                                        {message.usageMetadata && (
                                                            <>
                                                                <div className="flex items-center gap-1">
                                                                    <span>Tokens: {message.usageMetadata.totalTokenCount}</span>
                                                                </div>
                                                                {message.usageMetadata.thinkingTokenCount && message.usageMetadata.thinkingTokenCount > 0 && (
                                                                    <div className="flex items-center gap-1">
                                                                        <Brain className="w-3 h-3" />
                                                                        <span>Thinking: {message.usageMetadata.thinkingTokenCount}</span>
                                                                    </div>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Action Buttons */}
                                                <div className="flex items-center gap-2 mt-4">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0"
                                                        onClick={() => handleCopy(message.content, message.id)}
                                                    >
                                                        {copiedId === message.id ? (
                                                            <Check className="h-4 w-4 text-green-500" />
                                                        ) : (
                                                            <Copy className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                    <div className="ml-auto flex items-center gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 w-8 p-0"
                                                            onClick={() => onFeedback(message.id, 'down')}
                                                        >
                                                            <ThumbsDown className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 w-8 p-0"
                                                            onClick={() => onFeedback(message.id, 'up')}
                                                        >
                                                            <ThumbsUp className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                        <div className="mt-1 text-xs text-gray-500">
                                            {message.timestamp.toLocaleTimeString()}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex gap-4">
                            <Avatar className="w-10 h-10">
                                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                                    AI
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <Card className="border-2">
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce"></div>
                                            <div
                                                className="h-2 w-2 bg-blue-500 rounded-full animate-bounce"
                                                style={{ animationDelay: '0.1s' }}
                                            ></div>
                                            <div
                                                className="h-2 w-2 bg-blue-500 rounded-full animate-bounce"
                                                style={{ animationDelay: '0.2s' }}
                                            ></div>
                                            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                                                AI is thinking...
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="border-t bg-white dark:bg-slate-900 px-6 py-4">
                <div className="mx-auto max-w-4xl">
                    <form onSubmit={handleSubmit} className="relative">
                        <div className="flex items-center gap-2 bg-gray-50 dark:bg-slate-800 rounded-lg border-2 border-gray-200 dark:border-slate-700 p-2 focus-within:border-blue-500 transition-colors">
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 flex-shrink-0"
                                disabled={isLoading}
                            >
                                <Paperclip className="h-4 w-4" />
                            </Button>

                            {/* Built-in AI Tools Toggles */}
                            <div className="flex items-center gap-1 px-2 border-l border-r">
                                <Button
                                    type="button"
                                    variant={aiSettings.useThinking ? "default" : "ghost"}
                                    size="sm"
                                    className="h-7 px-2 flex items-center gap-1"
                                    onClick={() => onAISettingsChange({ ...aiSettings, useThinking: !aiSettings.useThinking })}
                                    disabled={isLoading}
                                    title="Advanced Thinking Mode"
                                >
                                    <Brain className="h-3.5 w-3.5" />
                                    <span className="text-xs">Think</span>
                                </Button>
                                <Button
                                    type="button"
                                    variant={aiSettings.useGoogleSearch ? "default" : "ghost"}
                                    size="sm"
                                    className="h-7 px-2 flex items-center gap-1"
                                    onClick={() => onAISettingsChange({ ...aiSettings, useGoogleSearch: !aiSettings.useGoogleSearch })}
                                    disabled={isLoading}
                                    title="Google Search"
                                >
                                    <Search className="h-3.5 w-3.5" />
                                    <span className="text-xs">Search</span>
                                </Button>
                                <Button
                                    type="button"
                                    variant={aiSettings.useCodeExecution ? "default" : "ghost"}
                                    size="sm"
                                    className="h-7 px-2 flex items-center gap-1"
                                    onClick={() => onAISettingsChange({ ...aiSettings, useCodeExecution: !aiSettings.useCodeExecution })}
                                    disabled={isLoading}
                                    title="Code Execution"
                                >
                                    <Code2 className="h-3.5 w-3.5" />
                                    <span className="text-xs">Code</span>
                                </Button>
                            </div>

                            {/* Tools Selector */}
                            <Popover open={showToolsPopover} onOpenChange={setShowToolsPopover}>
                                <PopoverTrigger asChild>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 px-2 flex-shrink-0 relative"
                                        disabled={isLoading || !aiSettings.useTools}
                                    >
                                        <Wrench className="h-4 w-4" />
                                        {selectedTools.length > 0 && (
                                            <Badge
                                                variant="default"
                                                className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-xs"
                                            >
                                                {selectedTools.length}
                                            </Badge>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-72 p-3" align="start" side="top">
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-semibold text-sm">Available Tools</h4>
                                            <Badge variant="outline" className="text-xs">
                                                {selectedTools.length}/{availableTools.length}
                                            </Badge>
                                        </div>
                                        <div className="space-y-2 max-h-64 overflow-auto">
                                            {availableTools.map((tool) => (
                                                <div
                                                    key={tool.id}
                                                    className="flex items-center space-x-2 p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-md cursor-pointer"
                                                    onClick={() => handleToolToggle(tool.id)}
                                                >
                                                    <Checkbox
                                                        id={tool.id}
                                                        checked={selectedTools.includes(tool.id)}
                                                        onCheckedChange={() => handleToolToggle(tool.id)}
                                                    />
                                                    <Label
                                                        htmlFor={tool.id}
                                                        className="flex items-center gap-2 text-sm font-medium cursor-pointer flex-1"
                                                    >
                                                        <tool.icon className="h-4 w-4" />
                                                        {tool.name}
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="pt-2 border-t">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="w-full text-xs"
                                                onClick={() => {
                                                    if (selectedTools.length === availableTools.length) {
                                                        onToggleTools([]);
                                                    } else {
                                                        onToggleTools(availableTools.map(t => t.id));
                                                    }
                                                }}
                                            >
                                                {selectedTools.length === availableTools.length ? 'Deselect All' : 'Select All'}
                                            </Button>
                                        </div>
                                    </div>
                                </PopoverContent>
                            </Popover>

                            <Input
                                value={input}
                                onChange={handleInputChange}
                                placeholder="Ask me anything about your blog..."
                                className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
                                disabled={isLoading}
                                autoFocus
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 flex-shrink-0"
                                disabled={isLoading}
                            >
                                <Mic className="h-4 w-4" />
                            </Button>
                            <Button
                                type="submit"
                                size="sm"
                                disabled={!input.trim() || isLoading}
                                className="h-8 px-4 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                            >
                                {isLoading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Send className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
