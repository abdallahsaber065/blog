/**
 * Public entrypoint for the Gemini service module.
 *
 * This file intentionally re-exports a small, well-organised API surface:
 *  - GeminiService class
 *  - Types and configuration interfaces
 *  - A pre-configured singleton `geminiService` for convenience
 */

import { GeminiService } from './service';

// Re-export core types and utilities for external consumers.
export { GeminiService } from './service';
export {
  KNOWN_GEMINI_MODELS,
  GEMINI_MODEL_CATALOG,
  type GeminiInputType,
  type GeminiOutputType,
  type GeminiModelInfo,
  type GeminiCandidate,
  type GeminiContent,
  type GeminiGenerateResponse,
  type GeminiGenerationOptions,
  type GeminiModelId,
  type GeminiModelSummary,
  type GeminiKnownModelId,
  type GeminiServiceConfig,
  type GeminiStructuredOptions,
  type GeminiStructuredResult,
  type GeminiTextOptions,
  type GeminiTextResult,
  type GeminiTextPart,
  type GeminiWebSearchOptions,
  type GeminiWebSearchResult,
  type GeminiAudioOptions,
} from './models';

/**
 * A default singleton instance that uses:
 *  - GEMINI_API_KEY from the environment
 *  - gemini-2.5-flash as the default model
 *  - a short, general-purpose system instruction
 *
 * You can either:
 *  - import { geminiService } from './gemini';
 *  - or create your own instance with new GeminiService(customConfig)
 */
export const geminiService = new GeminiService({
  defaultModel: 'gemini-2.5-flash',
  defaultSystemInstruction:
    'You are a helpful, concise assistant. Prefer short, direct, and correct answers.',
  defaultGenerationConfig: {
    temperature: 0.4,
    maxOutputTokens: 1024,
  },
});

