// Google Generative AI client configuration using @google/genai
import { GoogleGenAI } from '@google/genai';

// Initialize the Google Generative AI client only if API key is available
let aiClient: GoogleGenAI | null = null;

if (process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
    });
}

/**
 * Get the AI client instance
 * @throws {Error} if GEMINI_API_KEY is not set
 */
export function getAIClient(): GoogleGenAI {
    if (!aiClient) {
        throw new Error('GEMINI_API_KEY environment variable is not set');
    }
    return aiClient;
}

/**
 * Check if the AI client is initialized
 */
export function isAIClientInitialized(): boolean {
    return aiClient !== null;
}
