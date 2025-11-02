// Model configurations for different use cases
import { Type } from '@google/genai';

export interface ModelConfig {
    model: string;
    temperature?: number;
    topP?: number;
    topK?: number;
    maxOutputTokens?: number;
    responseMimeType?: string;
    responseSchema?: any;
    thinkingConfig?: {
        thinkingBudget?: number;
        includeThoughts?: boolean;
    };
    tools?: any[];
    systemInstruction?: string;
}

// Model configurations for different use cases
export const MODEL_CONFIGS: Record<string, ModelConfig> = {
    // Outline generation - structured JSON output
    outline: {
        model: 'gemini-2.5-flash',
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192,
        responseMimeType: 'application/json',
        thinkingConfig: {
            thinkingBudget: 1024, // Enable thinking for better outline structure
        },
    },

    // Content generation - markdown output with thinking
    content: {
        model: 'gemini-2.5-flash',
        temperature: 0.8,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192,
        thinkingConfig: {
            thinkingBudget: 2048, // More thinking for complex content
        },
    },

    // Metadata generation - structured JSON output
    metadata: {
        model: 'gemini-2.5-flash',
        temperature: 0.5,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 2048,
        responseMimeType: 'application/json',
    },

    // Image generation - using Gemini 2.5 Flash Image
    image: {
        model: 'gemini-2.5-flash-image-preview',
        temperature: 0.9,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 4096,
    },

    // Chat/Assistant mode - with extended thinking
    chat: {
        model: 'gemini-2.5-flash',
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192,
        thinkingConfig: {
            thinkingBudget: -1, // Dynamic thinking
            includeThoughts: true,
        },
    },

    // Pro model for complex tasks
    pro: {
        model: 'gemini-2.5-pro',
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192,
        thinkingConfig: {
            thinkingBudget: -1, // Dynamic thinking
        },
    },
};

// Response schema definitions
export const RESPONSE_SCHEMAS = {
    outline: {
        type: Type.OBJECT,
        properties: {
            main_title: { type: Type.STRING },
            introduction: { type: Type.STRING },
            sections: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        description: { type: Type.STRING },
                        points: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                        },
                    },
                    required: ['title', 'description'],
                },
            },
            conclusion: { type: Type.STRING },
            search_terms: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
            },
        },
        required: ['main_title', 'introduction', 'sections', 'conclusion'],
    },

    metadata: {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            excerpt: { type: Type.STRING },
            tags: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
            },
            main_category: { type: Type.STRING },
        },
        required: ['title', 'excerpt', 'tags', 'main_category'],
    },
};

/**
 * Get model configuration by name
 */
export function getModelConfig(configName: string): ModelConfig {
    const config = MODEL_CONFIGS[configName];
    if (!config) {
        throw new Error(`Model configuration '${configName}' not found`);
    }
    return config;
}

/**
 * Create a custom model configuration
 */
export function createModelConfig(
    baseConfig: string,
    overrides: Partial<ModelConfig>
): ModelConfig {
    const base = getModelConfig(baseConfig);
    return { ...base, ...overrides };
}
