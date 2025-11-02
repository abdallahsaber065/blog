// Chat API endpoint with streaming and tool support
import { getAIClient } from '@/lib/ai/client';
import { executeChatbotTool, getChatbotToolsConfig } from '@/lib/ai/tools/chatbot-tools';
import { hasFunctionCalls, parseFunctionCalls } from '@/lib/ai/tools/function-calling';
import type { NextApiRequest, NextApiResponse } from 'next';

interface ChatMessage {
    role: 'user' | 'model' | 'function';
    parts: Array<{ text?: string; functionCall?: any; functionResponse?: any }>;
}

interface ChatRequest {
    messages: ChatMessage[];
    useTools?: boolean;
    useThinking?: boolean;
    thinkingBudget?: number;
    useGoogleSearch?: boolean;
    useCodeExecution?: boolean;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const {
            messages = [],
            useTools = true,
            useThinking = true,
            thinkingBudget = 8192,
            useGoogleSearch = false,
            useCodeExecution = false
        } = req.body as ChatRequest;

        if (!messages || messages.length === 0) {
            return res.status(400).json({ error: 'Messages are required' });
        }

        // Get AI client
        const client = getAIClient();

        // Build chat configuration
        const chatConfig: any = {
            model: 'gemini-2.5-flash',
            config: {
                temperature: 0.7,
                topP: 0.95,
                topK: 40,
                maxOutputTokens: 8192,
                systemInstruction: `You are an intelligent blog assistant chatbot. You help users with:
- Finding and searching blog posts
- Managing content and categories
- Generating content ideas and outlines
- Providing blog statistics and insights
- Answering questions about the blog platform

You have access to various tools to interact with the blog API. Use them when appropriate to provide accurate, helpful responses.

Always be professional, clear, and concise in your responses. When using tools, explain what you're doing to help the user understand the process.`
            }
        };

        // Add tools array if any tool is enabled
        if (useTools || useGoogleSearch || useCodeExecution) {
            chatConfig.config.tools = [];
        }

        // Add custom function tools if enabled
        if (useTools) {
            chatConfig.config.tools.push(getChatbotToolsConfig());
        }

        // Add Google Search tool if enabled (new format for gemini-2.5)
        if (useGoogleSearch) {
            chatConfig.config.tools.push({ googleSearch: {} });
        }

        // Add Code Execution if enabled
        if (useCodeExecution) {
            chatConfig.config.tools.push({ codeExecution: {} });
        }

        // Add thinking config if enabled
        // Note: gemini-2.5-flash has thinking ENABLED by default
        // We can only disable it by setting thinkingBudget to 0
        if (useThinking && thinkingBudget > 0) {
            chatConfig.config.thinkingConfig = {
                thinkingBudget: thinkingBudget === -1 ? -1 : thinkingBudget
            };
        } else if (!useThinking) {
            // Disable thinking explicitly
            chatConfig.config.thinkingConfig = {
                thinkingBudget: 0
            };
        }

        // Convert messages to Gemini format for history
        const history = messages.slice(0, -1).map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: msg.parts
        }));

        // Add history to config if available
        if (history.length > 0) {
            chatConfig.history = history;
        }

        const lastMessage = messages[messages.length - 1];

        // Create chat session
        const chat = client.chats.create(chatConfig);

        // Send message and handle tool calls
        let result = await chat.sendMessage({ message: lastMessage.parts });
        let iterationCount = 0;
        const maxIterations = 5;

        // Handle function calling loop
        while (hasFunctionCalls(result) && iterationCount < maxIterations) {
            iterationCount++;

            const functionCalls = parseFunctionCalls(result);
            const functionResponses = [];

            // Execute all function calls
            for (const call of functionCalls) {
                console.log(`Executing tool: ${call.name}`, call.args);

                try {
                    const toolResult = await executeChatbotTool(
                        call.name,
                        call.args,
                        req.headers.authorization?.replace('Bearer ', '')
                    );

                    // Format function response according to Gemini API spec
                    functionResponses.push({
                        functionResponse: {
                            name: call.name,
                            response: {
                                result: toolResult
                            }
                        }
                    });
                } catch (error) {
                    console.error(`Error executing ${call.name}:`, error);
                    functionResponses.push({
                        functionResponse: {
                            name: call.name,
                            response: {
                                error: error instanceof Error ? error.message : 'Tool execution failed'
                            }
                        }
                    });
                }
            }

            // Send function responses back to model
            result = await chat.sendMessage({ message: functionResponses as any });
        }

        // Get final text response
        const text = result.text;

        // Extract usage metadata if available
        const usageMetadata = (result as any).usageMetadata || {};

        return res.status(200).json({
            message: text,
            role: 'model',
            usageMetadata: {
                promptTokenCount: usageMetadata.promptTokenCount || 0,
                candidatesTokenCount: usageMetadata.candidatesTokenCount || 0,
                totalTokenCount: usageMetadata.totalTokenCount || 0,
                thinkingTokenCount: usageMetadata.thinkingTokenCount || 0
            },
            toolCalls: iterationCount > 0 ? iterationCount : 0
        });

    } catch (error) {
        console.error('Chat API error:', error);
        return res.status(500).json({
            error: 'Failed to process chat message',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
