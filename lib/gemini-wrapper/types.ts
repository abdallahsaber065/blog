/**
 * Comprehensive type definitions for the Gemini API Wrapper
 * Built on top of @google/genai package
 */

import type {
  GenerateContentParameters,
  GenerateContentResponse,
  GenerateImagesParameters,
  GenerateImagesResponse,
  EditImageParameters,
  EditImageResponse,
  EmbedContentParameters,
  EmbedContentResponse,
  Content,
  Part,
  FunctionDeclaration,
  Tool,
  ToolConfig,
  GenerationConfig,
  SafetySetting,
  CreateCachedContentParameters,
  CachedContent,
  File,
  CountTokensParameters,
  CountTokensResponse,
  UploadFileParameters,
  UpdateCachedContentParameters,
  DownloadFileParameters,
} from '@google/genai';

// Re-export commonly used types from @google/genai
export type {
  GenerateContentParameters,
  GenerateContentResponse,
  GenerateImagesParameters,
  GenerateImagesResponse,
  EditImageParameters,
  EditImageResponse,
  EmbedContentParameters,
  EmbedContentResponse,
  Content,
  Part,
  FunctionDeclaration,
  Tool,
  ToolConfig,
  GenerationConfig,
  SafetySetting,
  CreateCachedContentParameters,
  CachedContent,
  File,
  CountTokensParameters,
  CountTokensResponse,
  UploadFileParameters,
  UpdateCachedContentParameters,
  DownloadFileParameters,
};

/**
 * Configuration options for initializing the Gemini Wrapper
 */
export interface GeminiWrapperConfig {
  /**
   * API Key for Gemini Developer API
   */
  apiKey?: string;

  /**
   * Use Vertex AI instead of Gemini Developer API
   */
  vertexai?: boolean;

  /**
   * Google Cloud Project ID (for Vertex AI)
   */
  project?: string;

  /**
   * Google Cloud Location (for Vertex AI)
   */
  location?: string;

  /**
   * API version (default: 'v1beta')
   */
  apiVersion?: string;

  /**
   * Default model to use for text generation
   */
  defaultModel?: string;

  /**
   * Default model to use for image generation
   */
  defaultImageModel?: string;

  /**
   * Default generation configuration
   */
  defaultGenerationConfig?: GenerationConfig;

  /**
   * Default safety settings
   */
  defaultSafetySettings?: SafetySetting[];
}

/**
 * Options for text generation
 */
export interface TextGenerationOptions {
  /**
   * The prompt or content to generate from
   */
  prompt: string | Content | Content[];

  /**
   * Model to use (overrides default)
   */
  model?: string;

  /**
   * Generation configuration
   */
  config?: GenerationConfig;

  /**
   * Safety settings
   */
  safetySettings?: SafetySetting[];

  /**
   * System instruction
   */
  systemInstruction?: string | Content;

  /**
   * Tools/functions to make available
   */
  tools?: Tool[];

  /**
   * Tool configuration
   */
  toolConfig?: ToolConfig;

  /**
   * Enable streaming
   */
  stream?: boolean;
}

/**
 * Options for image generation
 */
export interface ImageGenerationOptions {
  /**
   * Text prompt for image generation
   */
  prompt: string;

  /**
   * Number of images to generate (1-4)
   */
  numberOfImages?: number;

  /**
   * Model to use for generation
   */
  model?: string;

  /**
   * Aspect ratio (e.g., '1:1', '16:9', '9:16')
   */
  aspectRatio?: string;

  /**
   * Negative prompt (what to avoid)
   */
  negativePrompt?: string;

  /**
   * Reference image for style or content
   */
  referenceImage?: Part;

  /**
   * Generation configuration
   */
  config?: GenerationConfig;

  /**
   * Safety settings
   */
  safetySettings?: SafetySetting[];
}

/**
 * Options for image editing
 */
export interface ImageEditOptions {
  /**
   * The image to edit
   */
  image: Part;

  /**
   * Edit prompt
   */
  prompt: string;

  /**
   * Mask for the edit area
   */
  mask?: Part;

  /**
   * Reference image
   */
  referenceImage?: Part;

  /**
   * Model to use
   */
  model?: string;

  /**
   * Generation configuration
   */
  config?: GenerationConfig;

  /**
   * Safety settings
   */
  safetySettings?: SafetySetting[];
}

/**
 * Options for multimodal understanding
 */
export interface MultimodalOptions {
  /**
   * Text prompt
   */
  prompt: string;

  /**
   * Media parts (images, audio, video)
   */
  media: Part[];

  /**
   * Model to use
   */
  model?: string;

  /**
   * Generation configuration
   */
  config?: GenerationConfig;

  /**
   * Safety settings
   */
  safetySettings?: SafetySetting[];

  /**
   * System instruction
   */
  systemInstruction?: string | Content;
}

/**
 * Options for structured output
 */
export interface StructuredOutputOptions<T = any> {
  /**
   * The prompt
   */
  prompt: string | Content | Content[];

  /**
   * JSON schema for the expected output
   */
  schema: Record<string, any>;

  /**
   * Model to use
   */
  model?: string;

  /**
   * Generation configuration
   */
  config?: Omit<GenerationConfig, 'responseMimeType' | 'responseSchema'>;

  /**
   * Safety settings
   */
  safetySettings?: SafetySetting[];

  /**
   * System instruction
   */
  systemInstruction?: string | Content;
}

/**
 * Options for embeddings generation
 */
export interface EmbeddingOptions {
  /**
   * Content to embed
   */
  content: string | Content | Content[];

  /**
   * Model to use for embeddings
   */
  model?: string;

  /**
   * Task type
   */
  taskType?: 'RETRIEVAL_QUERY' | 'RETRIEVAL_DOCUMENT' | 'SEMANTIC_SIMILARITY' | 'CLASSIFICATION' | 'CLUSTERING';

  /**
   * Title for the content
   */
  title?: string;
}

/**
 * Options for file upload
 */
export interface FileUploadOptions {
  /**
   * File path or Blob
   */
  file: string | Blob;

  /**
   * MIME type
   */
  mimeType?: string;

  /**
   * Display name
   */
  displayName?: string;
}

/**
 * Options for caching
 */
export interface CacheOptions {
  /**
   * Model to cache for
   */
  model: string;

  /**
   * System instruction
   */
  systemInstruction?: string | Content;

  /**
   * Contents to cache
   */
  contents: Content[];

  /**
   * Tools to cache
   */
  tools?: Tool[];

  /**
   * Time to live in seconds
   */
  ttlSeconds?: number;
}

/**
 * Chat message interface
 */
export interface ChatMessage {
  role: 'user' | 'model';
  content: string | Part[];
}

/**
 * Chat options
 */
export interface ChatOptions {
  /**
   * Model to use
   */
  model?: string;

  /**
   * Generation configuration
   */
  config?: GenerationConfig;

  /**
   * Safety settings
   */
  safetySettings?: SafetySetting[];

  /**
   * System instruction
   */
  systemInstruction?: string | Content;

  /**
   * Initial history
   */
  history?: Content[];

  /**
   * Tools available in chat
   */
  tools?: Tool[];

  /**
   * Tool configuration
   */
  toolConfig?: ToolConfig;
}

/**
 * Function calling result
 */
export interface FunctionCallResult {
  name: string;
  args: Record<string, any>;
}

/**
 * Thinking/reasoning options
 */
export interface ThinkingOptions {
  /**
   * Prompt that requires reasoning
   */
  prompt: string;

  /**
   * Model to use (should support thinking)
   */
  model?: string;

  /**
   * Enable explicit thinking mode
   */
  enableThinking?: boolean;

  /**
   * Generation configuration
   */
  config?: GenerationConfig;

  /**
   * Safety settings
   */
  safetySettings?: SafetySetting[];
}
