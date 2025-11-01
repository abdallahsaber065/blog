// Google Generative AI client configuration
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Google Generative AI client only if API key is available
let genAI: GoogleGenerativeAI | null = null;

if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

// Model configurations for different use cases
export const MODEL_CONFIGS = {
  outline: {
    model: 'gemini-2.5-flash',
    generationConfig: {
      temperature: 0.7,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 8192,
      responseMimeType: 'application/json',
    },
  },
  content: {
    model: 'gemini-2.5-flash',
    generationConfig: {
      temperature: 0.8,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 8192,
    },
  },
  metadata: {
    model: 'gemini-2.5-flash',
    generationConfig: {
      temperature: 0.5,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 2048,
      responseMimeType: 'application/json',
    },
  },
};

/**
 * Get a model instance with the specified configuration
 */
export function getModel(configKey: keyof typeof MODEL_CONFIGS) {
  if (!genAI) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }

  const config = MODEL_CONFIGS[configKey];
  return genAI.getGenerativeModel({
    model: config.model,
    generationConfig: config.generationConfig,
  });
}
