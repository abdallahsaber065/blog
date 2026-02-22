/**
 * Shared TypeScript models and types for the Gemini service.
 *
 * This file is intentionally framework-agnostic so it can be copied
 * into any Node.js / Next.js project.
 */

/**
 * Known Gemini model IDs for the Gemini API.
 *
 * This list is NOT exhaustive – you can still pass a custom model string
 * using the `GeminiModelId` type. These entries mainly exist for good DX
 * (autocomplete + documentation).
 *
 * Source: https://ai.google.dev/gemini-api/docs/models (plus release notes).
 */
export const KNOWN_GEMINI_MODELS = {
  'gemini-3-pro-preview': {
    id: 'gemini-3-pro-preview',
    displayName: 'Gemini 3 Pro (preview)',
    description: 'Most capable reasoning model (multimodal).',
  },
  'gemini-3-flash-preview': {
    id: 'gemini-3-flash-preview',
    displayName: 'Gemini 3 Flash (preview)',
    description: 'Fast, cost‑efficient multimodal model.',
  },
  'gemini-2.5-flash': {
    id: 'gemini-2.5-flash',
    displayName: 'Gemini 2.5 Flash',
    description: 'High‑throughput, low‑latency production workhorse.',
  },
  'gemini-1.5-pro': {
    id: 'gemini-1.5-pro',
    displayName: 'Gemini 1.5 Pro',
    description: 'General purpose, large context, high quality.',
  },
  'gemini-1.5-flash': {
    id: 'gemini-1.5-flash',
    displayName: 'Gemini 1.5 Flash',
    description: 'Fast, cheaper, good for chat/agents.',
  },
} as const;

export type GeminiKnownModelId = keyof typeof KNOWN_GEMINI_MODELS;

/**
 * Allow both known models (nice autocompletion) AND arbitrary strings.
 */
export type GeminiModelId = GeminiKnownModelId | (string & {});

/**
 * Supported input types for models.
 */
export type GeminiInputType = 'text' | 'image' | 'video' | 'audio' | 'pdf';

/**
 * Supported output types for models.
 */
export type GeminiOutputType =
  | 'text'
  | 'image'
  | 'sound'
  | 'embedding';

export interface GeminiModelLimits {
  /**
   * Requests per minute (free tier limit).
   * `null` means "unlimited" or not applicable.
   */
  rpm?: number | null;

  /**
   * Tokens per minute (free tier limit).
   * `null` means "unlimited" or not applicable.
   */
  tpm?: number | null;

  /**
   * Requests per day (free tier limit).
   * `null` means "unlimited" or not applicable.
   */
  rpd?: number | null;
}

/**
 * Developer-facing metadata for models listed in the Gemini
 * console, including free-tier limits. This is NOT used by the
 * core service logic – it is purely for admin tooling, dashboards,
 * and documentation.
 */
export interface GeminiModelInfo extends GeminiModelLimits {
  /**
   * Human-friendly name as shown in the console.
   */
  consoleName: string;

  /**
   * Optional model ID to use in API calls.
   * Not all console entries have a stable public ID yet.
   */
  id?: string;

  /**
   * List of supported input types.
   */
  inputs: GeminiInputType[];

  /**
   * Primary output type.
   */
  output: GeminiOutputType;
}

export const GEMINI_MODEL_CATALOG: GeminiModelInfo[] = [
  // Text output models (implemented) --------------------------------------
  {
    consoleName: 'Gemini 2.5 Flash',
    id: 'gemini-2.5-flash',
    inputs: ['text', 'image', 'video', 'audio', 'pdf'],
    output: 'text',
    rpm: 5,
    tpm: 250_000,
    rpd: 20,
  },
  {
    consoleName: 'Gemini 2.5 Pro',
    id: 'gemini-2.5-pro',
    inputs: ['text', 'image', 'video', 'audio', 'pdf'],
    output: 'text',
    rpm: 15,
    tpm: null,
    rpd: 1_500,
  },
  {
    consoleName: 'Gemini 2 Flash',
    id: 'gemini-2.0-flash',
    inputs: ['text', 'image', 'video', 'audio', 'pdf'],
    output: 'text',
    rpm: 15,
    tpm: null,
    rpd: 1_500,
  },
  {
    consoleName: 'Gemini 2 Flash Exp',
    id: 'gemini-2.0-flash-exp',
    inputs: ['text', 'image', 'video', 'audio', 'pdf'],
    output: 'text',
    rpm: 15,
    tpm: null,
    rpd: 1_500,
  },
  {
    consoleName: 'Gemini 2 Flash Lite',
    id: 'gemini-2.0-flash-lite',
    inputs: ['text', 'image', 'video', 'audio', 'pdf'],
    output: 'text',
    rpm: 15,
    tpm: null,
    rpd: 1_500,
  },
  {
    consoleName: 'Gemini 2 Pro Exp',
    id: 'gemini-2.0-pro-exp',
    inputs: ['text', 'image', 'video', 'audio', 'pdf'],
    output: 'text',
    rpm: 15,
    tpm: null,
    rpd: 1_500,
  },
  {
    consoleName: 'Gemini 2.5 Flash Lite',
    id: 'gemini-2.5-flash-lite',
    inputs: ['text', 'image', 'video', 'audio', 'pdf'],
    output: 'text',
    rpm: 10,
    tpm: 250_000,
    rpd: 20,
  },
  {
    consoleName: 'Gemini 3 Pro',
    id: 'gemini-3-pro',
    inputs: ['text', 'image', 'video', 'audio', 'pdf'],
    output: 'text',
    rpm: 15,
    tpm: null,
    rpd: 1_500,
  },
  {
    consoleName: 'Gemini 3 Flash',
    id: 'gemini-3-flash',
    inputs: ['text', 'image', 'video', 'audio', 'pdf'],
    output: 'text',
    rpm: 5,
    tpm: 250_000,
    rpd: 20,
  },

  // Text output models - lightweight (for future support) -----------------
  {
    consoleName: 'Gemma 3 1B',
    id: 'gemma-3-1b',
    inputs: ['text'],
    output: 'text',
    rpm: 30,
    tpm: 15_000,
    rpd: 14_400,
  },
  {
    consoleName: 'Gemma 3 2B',
    id: 'gemma-3-2b',
    inputs: ['text'],
    output: 'text',
    rpm: 30,
    tpm: 15_000,
    rpd: 14_400,
  },
  {
    consoleName: 'Gemma 3 4B',
    id: 'gemma-3-4b',
    inputs: ['text'],
    output: 'text',
    rpm: 30,
    tpm: 15_000,
    rpd: 14_400,
  },
  {
    consoleName: 'Gemma 3 12B',
    id: 'gemma-3-12b',
    inputs: ['text'],
    output: 'text',
    rpm: 30,
    tpm: 15_000,
    rpd: 14_400,
  },
  {
    consoleName: 'Gemma 3 27B',
    id: 'gemma-3-27b',
    inputs: ['text'],
    output: 'text',
    rpm: 30,
    tpm: 15_000,
    rpd: 14_400,
  },

  // Sound output models (for future support) ------------------------------
  {
    consoleName: 'Gemini 2.5 Flash TTS',
    id: 'gemini-2.5-flash-tts',
    inputs: ['text'],
    output: 'sound',
    rpm: 3,
    tpm: 10_000,
    rpd: 10,
  },
  {
    consoleName: 'Gemini 2.5 Pro TTS',
    id: 'gemini-2.5-pro-tts',
    inputs: ['text'],
    output: 'sound',
    rpm: 15,
    tpm: null,
    rpd: 1_500,
  },
  {
    consoleName: 'Gemini 2.5 Flash Native Audio Dialog',
    id: 'gemini-2.5-flash-native-audio-dialog',
    inputs: ['text', 'audio'],
    output: 'sound',
    rpm: null,
    tpm: 1_000_000,
    rpd: null,
  },

  // Image output models (for future support) ------------------------------
  {
    consoleName: 'Imagen 4 Generate',
    id: 'imagen-4-generate',
    inputs: ['text'],
    output: 'image',
    rpm: null,
    tpm: null,
    rpd: null,
  },
  {
    consoleName: 'Imagen 4 Ultra Generate',
    id: 'imagen-4-ultra-generate',
    inputs: ['text'],
    output: 'image',
    rpm: null,
    tpm: null,
    rpd: null,
  },
  {
    consoleName: 'Imagen 4 Fast Generate',
    id: 'imagen-4-fast-generate',
    inputs: ['text'],
    output: 'image',
    rpm: null,
    tpm: null,
    rpd: null,
  },
  {
    consoleName: 'Nano Banana (Gemini 2.5 Flash Preview Image)',
    id: 'gemini-2.5-flash-image-preview',
    inputs: ['text'],
    output: 'image',
    rpm: 15,
    tpm: null,
    rpd: 1_500,
  },
  {
    consoleName: 'Nano Banana Pro (Gemini 3 Pro Image)',
    id: 'gemini-3-pro-image-preview',
    inputs: ['text'],
    output: 'image',
    rpm: null,
    tpm: null,
    rpd: null,
  },

  // Embedding models (for future support) --------------------------------
  {
    consoleName: 'Gemini Embedding 1',
    id: 'gemini-embedding-1',
    inputs: ['text'],
    output: 'embedding',
    rpm: 100,
    tpm: 30_000,
    rpd: 1_000,
  },

  // Specialized models (for future support) ------------------------------

  {
    consoleName: 'Computer Use Preview',
    id: 'gemini-computer-use-preview',
    inputs: ['text', 'image'],
    output: 'text',
    rpm: 15,
    tpm: null,
    rpd: 1_500,
  },
  {
    consoleName: 'Deep Research Pro Preview',
    id: 'deep-research-pro-preview',
    inputs: ['text', 'image', 'video', 'audio', 'pdf'],
    output: 'text',
    rpm: 15,
    tpm: null,
    rpd: 1_500,
  },
];

/**
 * Minimal text part representation from the Gemini API.
 * We only expose what the service actually uses.
 */
export interface GeminiTextPart {
  text?: string;
}

/**
 * High-level input part for multimodal requests.
 *
 * This is intentionally small but expressive:
 *  - `text`        : plain text
 *  - `file`        : reference to an uploaded file (file URI)
 *  - `inlineBytes` : raw bytes provided at call time (Node: Buffer / Uint8Array / ArrayBuffer)
 */
export type GeminiInputPart =
  | {
    type: 'text';
    text: string;
  }
  | {
    type: 'file';
    fileUri: string;
    mimeType?: string;
  }
  | {
    type: 'inlineBytes';
    data: ArrayBuffer | Uint8Array | Buffer;
    mimeType: string;
  };

export interface GeminiContent {
  role?: string;
  parts: GeminiTextPart[];
}

/**
 * High-level content input used when you want full control over
 * multimodal requests.
 */
export interface GeminiContentInput {
  role?: string;
  parts: GeminiInputPart[];
}

export interface GeminiCandidate {
  content?: GeminiContent;
  finishReason?: string;
}

export interface GeminiUsageMetadata {
  promptTokenCount?: number;
  candidatesTokenCount?: number;
  totalTokenCount?: number;
}

export interface GeminiGenerateResponse {
  candidates?: GeminiCandidate[];
  usageMetadata?: GeminiUsageMetadata;
  // The real API returns more fields; they are intentionally omitted here
  // to keep the public surface area small and stable.
}

/**
 * Base config shared by generateText / generateStructured.
 * Mirrors the commonly-used fields from GenerateContentConfig.
 */
export interface GeminiGenerationOptions {
  /**
   * Model to use. Defaults to service.defaultModel.
   */
  model?: GeminiModelId;

  /**
   * Optional system prompt for this call.
   * You can also set a global default in GeminiServiceConfig.
   */
  systemInstruction?: string;

  /**
   * Sampling / output config. This gets merged with
   * the service's defaultGenerationConfig.
   */
  config?: {
    temperature?: number;
    topK?: number;
    topP?: number;
    maxOutputTokens?: number;
    candidateCount?: number;
    stopSequences?: string[];
    seed?: number;
    /**
     * Catch‑all for any additional fields supported by
     * @google/genai GenerateContentConfig.
     */
    [key: string]: unknown;
  };
}

/**
 * Text / multimodal generation options.
 *
 * You can:
 *  - pass just `prompt`
 *  - or pass full `contents`
 *  - or both (prompt will be appended to contents as a final user message)
 */
export interface GeminiTextOptions extends GeminiGenerationOptions {
  prompt?: string;
  contents?: GeminiContentInput[];
}

export interface GeminiTextResult {
  text: string;
  raw: GeminiGenerateResponse;
}

/**
 * Structured output options.
 * T is the expected decoded TypeScript type of the JSON payload.
 */
export interface GeminiStructuredOptions<T> extends GeminiGenerationOptions {
  prompt?: string;

  /**
   * Optional explicit contents. If provided, they will be sent as-is.
   * If both `contents` and `prompt` are provided, the prompt is appended
   * as a final user message.
   */
  contents?: GeminiContentInput[];

  /**
   * JSON Schema or OpenAPI-subset schema passed to the Gemini API
   * via `responseSchema` or `responseJsonSchema`.
   */
  schema: unknown;

  /**
   * Response mimetype. For structured outputs this should almost
   * always be `application/json`.
   */
  mimeType?: 'application/json' | string;

  /**
   * If true, use `responseJsonSchema` instead of `responseSchema`.
   * Useful when you rely on full JSON Schema features.
   */
  useJsonSchema?: boolean;

  /**
   * Optional post‑processor (e.g. runtime validation with Zod).
   * If provided, the parsed JSON will be passed through this function.
   */
  transform?: (parsed: unknown) => T;
}

export interface GeminiStructuredResult<T> {
  data: T;
  rawText: string;
  raw: GeminiGenerateResponse;
}

/**
 * Simplified model summary for listModels().
 */
export interface GeminiModelSummary {
  name: string;
  displayName?: string;
  description?: string;
  inputTokenLimit?: number;
  outputTokenLimit?: number;
  supportedGenerationMethods?: string[];
}

/**
 * Public configuration interface for constructing a GeminiService.
 */
export interface GeminiServiceConfig {
  /**
   * API key for the Gemini API.
   * If omitted, process.env.GEMINI_API_KEY is used.
   */
  apiKey?: string;

  /**
   * Default model to use when none is provided.
   */
  defaultModel?: GeminiModelId;

  /**
   * Optional global system instruction applied to every call,
   * unless overridden per‑request.
   */
  defaultSystemInstruction?: string;

  /**
   * Default generation config merged into every request.
   */
  defaultGenerationConfig?: GeminiGenerationOptions['config'];

  /**
   * Whether to use Vertex AI instead of the standalone Gemini API.
   * If true, you must also specify project + location.
   */
  useVertexAI?: boolean;

  project?: string;
  location?: string;
}

/**
 * Fully resolved configuration used internally by the service.
 */
export interface ResolvedGeminiServiceConfig {
  apiKey?: string;
  useVertexAI: boolean;
  project?: string;
  location?: string;

  defaultModel: GeminiModelId;
  defaultSystemInstruction?: string;
  defaultGenerationConfig?: GeminiGenerationOptions['config'];
}

/**
 * Result returned by a web-search-grounded generation call.
 */
export interface GeminiWebSearchResult {
  text: string;
  /** The grounding metadata returned by the API (search queries, sources, etc.) */
  groundingMetadata?: unknown;
  raw: GeminiGenerateResponse;
}

/**
 * Options for web-search-grounded generation.
 */
export interface GeminiWebSearchOptions extends GeminiGenerationOptions {
  /** Main prompt / question */
  prompt: string;
  /** URLs to include as context hints in the prompt */
  contextUrls?: string[];
}

/**
 * Options for audio-input generation (voice notes, etc.).
 */
export interface GeminiAudioOptions extends GeminiGenerationOptions {
  /** Inline audio bytes (e.g. WebM/Opus from MediaRecorder) */
  audioData: ArrayBuffer | Uint8Array | Buffer;
  mimeType: string;
  /** Optional extra text appended after the audio */
  textPrompt?: string;
}

/**
 * Sources the upload helper can accept.
 *
 * - `path`       : local filesystem path (Node.js only)
 * - `blob`       : a Blob instance
 * - `bytes`      : raw bytes + explicit mimeType
 */
export type GeminiUploadSource =
  | {
    kind: 'path';
    path: string;
    mimeType?: string;
  }
  | {
    kind: 'blob';
    blob: Blob;
    mimeType?: string;
  }
  | {
    kind: 'bytes';
    data: ArrayBuffer | Uint8Array | Buffer;
    mimeType: string;
  };

/**
 * Minimal metadata we care about from an uploaded file.
 */
export interface GeminiUploadedFile {
  /**
   * Resource name of the file, e.g. "files/abc123".
   */
  name: string;

  /**
   * URI to use in `fileData.fileUri` when calling models.
   */
  uri: string;

  mimeType?: string;
  displayName?: string;
  sizeBytes?: number;
}


