/**
 * Gemini Client using the new comprehensive wrapper
 * Replaces the old @google/generative-ai implementation
 */

import { GeminiWrapper, type GeminiWrapperConfig } from '@/lib/gemini-wrapper';

// Initialize the wrapper with environment configuration
let geminiInstance: GeminiWrapper | null = null;

/**
 * Get or create the Gemini wrapper instance
 */
export function getGeminiWrapper(): GeminiWrapper {
  if (!geminiInstance) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY environment variable is not set');
    }

    const config: GeminiWrapperConfig = {
      apiKey: process.env.GEMINI_API_KEY,
      defaultModel: 'gemini-2.0-flash-exp',
      defaultImageModel: 'imagen-3.0-generate-001',
      apiVersion: 'v1beta',
    };

    geminiInstance = new GeminiWrapper(config);
  }

  return geminiInstance;
}

/**
 * Model configurations for different use cases
 * Maintained for backward compatibility with existing code
 */
export const MODEL_CONFIGS = {
  outline: {
    model: 'gemini-2.0-flash-exp',
    temperature: 0.7,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
  },
  content: {
    model: 'gemini-2.0-flash-exp',
    temperature: 0.8,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
  },
  metadata: {
    model: 'gemini-2.0-flash-exp',
    temperature: 0.5,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 2048,
  },
};

/**
 * Get generation configuration for a specific use case
 */
export function getConfig(configKey: keyof typeof MODEL_CONFIGS) {
  const config = MODEL_CONFIGS[configKey];
  return {
    temperature: config.temperature,
    topP: config.topP,
    topK: config.topK,
    maxOutputTokens: config.maxOutputTokens,
  };
}

/**
 * Backward compatibility export
 * Use this for existing code that imports from gemini-client
 */
export const gemini = getGeminiWrapper();

// Default export
export default gemini;
