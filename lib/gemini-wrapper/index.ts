/**
 * Comprehensive Google Gemini API Wrapper
 * 
 * A robust, scalable, and feature-complete wrapper around the @google/genai package.
 * Designed for content generation systems with support for all Gemini API capabilities.
 * 
 * @packageDocumentation
 */

import { GeminiClient } from './client';
import { TextGeneration, ChatManager } from './text-generation';
import { ImageGeneration } from './image-generation';
import { Multimodal } from './multimodal';
import { Embeddings } from './embeddings';
import { FileManager } from './file-manager';
import { CacheManager } from './cache-manager';

// Import enums from @google/genai for re-export
import { FunctionCallingConfigMode } from '@google/genai';

import type {
  GeminiWrapperConfig,
  TextGenerationOptions,
  ImageGenerationOptions,
  ImageEditOptions,
  MultimodalOptions,
  EmbeddingOptions,
  FileUploadOptions,
  CacheOptions,
  ChatOptions,
  StructuredOutputOptions,
  ThinkingOptions,
} from './types';

// Re-export all types
export * from './types';

// Re-export enums
export { FunctionCallingConfigMode };

// Re-export component classes for advanced usage
export {
  GeminiClient,
  TextGeneration,
  ChatManager,
  ImageGeneration,
  Multimodal,
  Embeddings,
  FileManager,
  CacheManager,
};

/**
 * Comprehensive Gemini API Wrapper
 * 
 * This is the main entry point for interacting with the Gemini API.
 * It provides a unified interface to all Gemini capabilities.
 * 
 * @example
 * ```typescript
 * // Initialize the wrapper
 * const gemini = new GeminiWrapper({
 *   apiKey: process.env.GEMINI_API_KEY
 * });
 * 
 * // Generate text
 * const response = await gemini.text.generate({
 *   prompt: "Explain quantum computing"
 * });
 * 
 * // Generate images
 * const images = await gemini.image.generate({
 *   prompt: "A futuristic cityscape at sunset"
 * });
 * 
 * // Use multimodal understanding
 * const analysis = await gemini.multimodal.analyze({
 *   prompt: "What's in this image?",
 *   media: [imageData]
 * });
 * ```
 */
export class GeminiWrapper {
  private client: GeminiClient;

  /**
   * Text generation capabilities
   */
  public readonly text: TextGeneration;

  /**
   * Chat management for multi-turn conversations
   */
  public readonly chat: ChatManager;

  /**
   * Image generation and editing
   */
  public readonly image: ImageGeneration;

  /**
   * Multimodal understanding (text, image, audio, video)
   */
  public readonly multimodal: Multimodal;

  /**
   * Embeddings generation
   */
  public readonly embeddings: Embeddings;

  /**
   * File upload and management
   */
  public readonly files: FileManager;

  /**
   * Context caching for cost optimization
   */
  public readonly cache: CacheManager;

  /**
   * Creates a new Gemini Wrapper instance
   * 
   * @param config - Configuration options
   * 
   * @example
   * ```typescript
   * // Using Gemini Developer API
   * const gemini = new GeminiWrapper({
   *   apiKey: process.env.GEMINI_API_KEY,
   *   defaultModel: "gemini-2.0-flash-exp"
   * });
   * 
   * // Using Vertex AI
   * const gemini = new GeminiWrapper({
   *   vertexai: true,
   *   project: "my-project",
   *   location: "us-central1"
   * });
   * ```
   */
  constructor(config: GeminiWrapperConfig) {
    // Initialize the client
    this.client = new GeminiClient(config);

    // Initialize all feature modules
    this.text = new TextGeneration(this.client);
    this.chat = new ChatManager(this.client);
    this.image = new ImageGeneration(this.client);
    this.multimodal = new Multimodal(this.client);
    this.embeddings = new Embeddings(this.client);
    this.files = new FileManager(this.client);
    this.cache = new CacheManager(this.client);
  }

  /**
   * Get the underlying client for advanced usage
   * Provides direct access to the native Google Gen AI SDK
   * 
   * @returns The GeminiClient instance
   */
  public getClient(): GeminiClient {
    return this.client;
  }

  /**
   * Get the current configuration
   * 
   * @returns The wrapper configuration
   */
  public getConfig(): Required<GeminiWrapperConfig> {
    return this.client.getConfig();
  }

  /**
   * Check if using Vertex AI
   * 
   * @returns True if using Vertex AI, false if using Gemini Developer API
   */
  public isVertexAI(): boolean {
    return this.client.isVertexAI();
  }

  /**
   * Quick text generation helper
   * Simplified method for common use cases
   * 
   * @param prompt - Text prompt
   * @param model - Optional model override
   * @returns Response text
   * 
   * @example
   * ```typescript
   * const text = await gemini.generate("Explain photosynthesis");
   * console.log(text);
   * ```
   */
  async generate(prompt: string, model?: string): Promise<string> {
    const response = await this.text.generate({ prompt, model });
    return response.text || '';
  }

  /**
   * Quick streaming text generation helper
   * 
   * @param prompt - Text prompt
   * @param model - Optional model override
   * @returns Async generator yielding text chunks
   * 
   * @example
   * ```typescript
   * for await (const chunk of await gemini.generateStream("Write a story")) {
   *   process.stdout.write(chunk);
   * }
   * ```
   */
  async generateStream(prompt: string, model?: string): Promise<AsyncGenerator<string>> {
    const stream = await this.text.generateStream({ prompt, model });

    async function* textStream() {
      for await (const chunk of stream) {
        yield chunk.text || '';
      }
    }

    return textStream();
  }

  /**
   * Quick structured output helper
   * 
   * @param prompt - Text prompt
   * @param schema - JSON schema for output
   * @param model - Optional model override
   * @returns Parsed JSON object
   * 
   * @example
   * ```typescript
   * const data = await gemini.generateJSON(
   *   "Extract info about Apple Inc.",
   *   {
   *     type: "object",
   *     properties: {
   *       name: { type: "string" },
   *       founded: { type: "number" }
   *     }
   *   }
   * );
   * ```
   */
  async generateJSON<T = any>(
    prompt: string,
    schema: Record<string, any>,
    model?: string
  ): Promise<T> {
    const response = await this.text.generateStructured({ prompt, schema, model });
    return JSON.parse(response.text || '{}');
  }

  /**
   * Count tokens in a prompt
   * Useful for estimating costs and checking limits
   * 
   * @param prompt - Text prompt or content
   * @param model - Optional model to count for
   * @returns Token count information
   * 
   * @example
   * ```typescript
   * const count = await gemini.countTokens("Long prompt text...");
   * console.log(count.totalTokens);
   * ```
   */
  async countTokens(prompt: string | any, model?: string) {
    const useModel = model || this.client.getDefaultModel();
    const contents = typeof prompt === 'string'
      ? [{ role: 'user', parts: [{ text: prompt }] }]
      : prompt;

    return await this.client.models.countTokens({
      model: useModel,
      contents,
    });
  }

  /**
   * List available models
   * 
   * @returns List of available models
   * 
   * @example
   * ```typescript
   * const models = await gemini.listModels();
   * for (const model of models.models) {
   *   console.log(model.name, model.displayName);
   * }
   * ```
   */
  async listModels() {
    return await this.client.models.list({});
  }

  /**
   * Get information about a specific model
   * 
   * @param modelName - Name of the model
   * @returns Model information
   * 
   * @example
   * ```typescript
   * const model = await gemini.getModel("gemini-2.0-flash-exp");
   * console.log(model.inputTokenLimit);
   * ```
   */
  async getModel(modelName: string) {
    return await this.client.models.get({ model: modelName });
  }
}

/**
 * Factory function to create a GeminiWrapper instance
 * Alternative to using the constructor
 * 
 * @param config - Configuration options
 * @returns GeminiWrapper instance
 * 
 * @example
 * ```typescript
 * const gemini = createGeminiWrapper({
 *   apiKey: process.env.GEMINI_API_KEY
 * });
 * ```
 */
export function createGeminiWrapper(config: GeminiWrapperConfig): GeminiWrapper {
  return new GeminiWrapper(config);
}

/**
 * Default export for convenience
 */
export default GeminiWrapper;
