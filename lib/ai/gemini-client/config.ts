/**
 * Configuration helpers for the Gemini service.
 */

import {
  GeminiServiceConfig,
  ResolvedGeminiServiceConfig,
  GeminiModelId,
} from './models';

/**
 * Default model used when the caller does not specify one.
 * You can safely change this in your project if you prefer a different default.
 */
export const DEFAULT_GEMINI_MODEL: GeminiModelId = 'gemini-2.5-flash';

/**
 * Build a fully-resolved, validated configuration for GeminiService.
 */
export function resolveGeminiConfig(
  config: GeminiServiceConfig = {},
): ResolvedGeminiServiceConfig {
  const {
    apiKey = process.env.GEMINI_API_KEY,
    defaultModel = DEFAULT_GEMINI_MODEL,
    defaultSystemInstruction,
    defaultGenerationConfig,
    useVertexAI = false,
    project,
    location,
  } = config;

  if (!useVertexAI && !apiKey) {
    throw new Error(
      'GeminiService: GEMINI_API_KEY is required (set env GEMINI_API_KEY or pass apiKey).',
    );
  }

  if (useVertexAI && (!project || !location)) {
    throw new Error(
      'GeminiService: project and location are required when useVertexAI = true.',
    );
  }

  const resolved: ResolvedGeminiServiceConfig = {
    apiKey,
    useVertexAI,
    project,
    location,
    defaultModel,
    defaultSystemInstruction,
    defaultGenerationConfig,
  };

  return resolved;
}

