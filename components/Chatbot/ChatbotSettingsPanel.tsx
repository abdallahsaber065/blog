'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
    Brain,
    FileText,
    Info,
    MessageSquare,
    Plug,
    Settings,
    Sparkles,
    X
} from 'lucide-react';
import { useState } from 'react';

interface AISettings {
    useThinking: boolean;
    thinkingBudget: number;
    useGoogleSearch: boolean;
    useCodeExecution: boolean;
    useTools: boolean;
}

interface ChatbotSettingsPanelProps {
    settings: AISettings;
    onSettingsChange: (settings: AISettings) => void;
    onClose: () => void;
}

export function ChatbotSettingsPanel({
    settings,
    onSettingsChange,
    onClose
}: ChatbotSettingsPanelProps) {
    const [systemPrompt, setSystemPrompt] = useState('');
    const [savedPrompts, setSavedPrompts] = useState<string[]>([
        'Act as a professional content writer',
        'Help me brainstorm blog ideas',
        'Provide SEO-optimized content suggestions',
        'Analyze content for readability'
    ]);

    const updateSetting = (key: keyof AISettings, value: any) => {
        onSettingsChange({ ...settings, [key]: value });
    };

    return (
        <div className="w-96 border-l bg-white dark:bg-slate-900 flex flex-col h-full">
            {/* Header */}
            <div className="border-b p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    <h2 className="text-lg font-semibold">Advanced Settings</h2>
                </div>
                <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
                    <X className="w-4 h-4" />
                </Button>
            </div>

            {/* Settings Content */}
            <ScrollArea className="flex-1">
                <Tabs defaultValue="prompts" className="w-full">
                    <TabsList className="w-full grid grid-cols-3 mx-4 my-2">
                        <TabsTrigger value="prompts" className="text-xs">
                            <MessageSquare className="w-3 h-3 mr-1" />
                            Prompts
                        </TabsTrigger>
                        <TabsTrigger value="thinking" className="text-xs">
                            <Brain className="w-3 h-3 mr-1" />
                            Thinking
                        </TabsTrigger>
                        <TabsTrigger value="mcp" className="text-xs">
                            <Plug className="w-3 h-3 mr-1" />
                            MCP
                        </TabsTrigger>
                    </TabsList>

                    <div className="p-4">
                        {/* Prompts Tab */}
                        <TabsContent value="prompts" className="mt-0 space-y-4">
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-blue-500" />
                                        Custom System Prompt
                                    </CardTitle>
                                    <CardDescription className="text-xs">
                                        Override the default AI behavior
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <Textarea
                                        placeholder="Enter your custom system prompt..."
                                        value={systemPrompt}
                                        onChange={(e) => setSystemPrompt(e.target.value)}
                                        className="min-h-[100px] text-sm"
                                    />
                                    <Button size="sm" className="w-full">
                                        <Sparkles className="w-3 h-3 mr-1" />
                                        Apply Prompt
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base">Saved Prompts</CardTitle>
                                    <CardDescription className="text-xs">
                                        Quick access to common prompts
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {savedPrompts.map((prompt, idx) => (
                                        <Button
                                            key={idx}
                                            variant="outline"
                                            size="sm"
                                            className="w-full justify-start text-xs h-auto py-2"
                                            onClick={() => setSystemPrompt(prompt)}
                                        >
                                            {prompt}
                                        </Button>
                                    ))}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Thinking Tab */}
                        <TabsContent value="thinking" className="mt-0 space-y-4">
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <Brain className="w-4 h-4 text-purple-500" />
                                        Thinking Budget
                                    </CardTitle>
                                    <CardDescription className="text-xs">
                                        Control reasoning depth and token allocation
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="space-y-2">
                                        <Label htmlFor="thinkingBudget" className="text-xs">
                                            Token Budget: {settings.thinkingBudget === -1 ? 'Auto' : settings.thinkingBudget}
                                        </Label>
                                        <Input
                                            id="thinkingBudget"
                                            type="range"
                                            value={settings.thinkingBudget === -1 ? 16384 : settings.thinkingBudget}
                                            onChange={(e) => updateSetting('thinkingBudget', parseInt(e.target.value))}
                                            min="512"
                                            max="16384"
                                            step="512"
                                            className="h-2"
                                        />
                                        <div className="flex gap-2 flex-wrap">
                                            {[1024, 2048, 4096, 8192, 16384].map((budget) => (
                                                <Badge
                                                    key={budget}
                                                    variant={settings.thinkingBudget === budget ? "default" : "outline"}
                                                    className="cursor-pointer text-xs"
                                                    onClick={() => updateSetting('thinkingBudget', budget)}
                                                >
                                                    {budget}
                                                </Badge>
                                            ))}
                                            <Badge
                                                variant={settings.thinkingBudget === -1 ? "default" : "outline"}
                                                className="cursor-pointer text-xs"
                                                onClick={() => updateSetting('thinkingBudget', -1)}
                                            >
                                                Auto
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                        <p>• Higher values = deeper reasoning</p>
                                        <p>• Lower values = faster responses</p>
                                        <p>• Auto = dynamic allocation based on query</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* MCP Tab */}
                        <TabsContent value="mcp" className="mt-0 space-y-4">
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <Plug className="w-4 h-4 text-green-500" />
                                        Model Context Protocol
                                    </CardTitle>
                                    <CardDescription className="text-xs">
                                        Connect external tools and services
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        <p className="mb-2">Coming soon:</p>
                                        <ul className="space-y-1 text-xs pl-4">
                                            <li>• Custom MCP server connections</li>
                                            <li>• External API integrations</li>
                                            <li>• Database query tools</li>
                                            <li>• File system access</li>
                                        </ul>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
                                <CardContent className="p-4">
                                    <div className="flex gap-3">
                                        <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                                        <div className="text-xs space-y-2">
                                            <p className="font-medium text-blue-900 dark:text-blue-100">
                                                About MCP
                                            </p>
                                            <p className="text-blue-800 dark:text-blue-200">
                                                MCP enables AI models to securely connect with external data sources and tools, expanding their capabilities beyond their training data.
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </div>
                </Tabs>
            </ScrollArea>

            {/* Footer */}
            <div className="border-t p-4">
                <Button
                    onClick={onClose}
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                >
                    Close
                </Button>
            </div>
        </div>
    );
}
