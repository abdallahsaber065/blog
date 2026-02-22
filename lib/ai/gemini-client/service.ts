/**
 * High-level Gemini service built on top of @google/genai.
 *
 * This module is intentionally framework-agnostic so it can be reused
 * across Node.js and Next.js projects (e.g., in API routes).
 */

import { GoogleGenAI } from '@google/genai';
import path from 'node:path';
import {
  GeminiCandidate,
  GeminiContent,
  GeminiContentInput,
  GeminiGenerateResponse,
  GeminiGenerationOptions,
  GeminiModelSummary,
  GeminiServiceConfig,
  GeminiStructuredOptions,
  GeminiStructuredResult,
  GeminiTextOptions,
  GeminiTextResult,
  GeminiUploadSource,
  GeminiUploadedFile,
  GeminiWebSearchOptions,
  GeminiWebSearchResult,
  GeminiAudioOptions,
} from './models';
import { resolveGeminiConfig } from './config';

export async function detectMimeType(
  filePath: string,
  explicit?: string,
): Promise<string | undefined> {
  // 1) Explicit value wins.
  if (explicit) {
    return explicit;
  }

  // 2) Try file-type (content-based detection).
  // Using dynamic import for ESM-only module compatibility
  try {
    const fileType = await import('file-type');
    const fileTypeFromFile = fileType.fileTypeFromFile as (
      path: string,
    ) => Promise<{ mime?: string } | undefined>;
    const result = await fileTypeFromFile(filePath);
    if (result?.mime) {
      return result.mime;
    }
  } catch {
    // Ignore and fall through to extension-based detection.
  }

  // 3) Fallback to mime.getType (extension-based).
  try {
    const mimeModule = await import('mime');
    const getType = mimeModule.default.getType as (path: string) => string | null;
    const byExt = getType(filePath);
    return byExt ?? undefined;
  } catch {
    return undefined;
  }
}

/**
 * Typed wrapper around the Gemini API.
 */
export class GeminiService {
  private readonly client: GoogleGenAI;

  readonly defaultModel;
  readonly defaultSystemInstruction?;
  readonly defaultGenerationConfig?;

  constructor(config: GeminiServiceConfig = {}) {
    const resolved = resolveGeminiConfig(config);

    this.client = new GoogleGenAI(
      resolved.useVertexAI
        ? {
          vertexai: true,
          project: resolved.project!,
          location: resolved.location!,
        }
        : {
          apiKey: resolved.apiKey!,
        },
    );

    this.defaultModel = resolved.defaultModel;
    this.defaultSystemInstruction = resolved.defaultSystemInstruction;
    this.defaultGenerationConfig = resolved.defaultGenerationConfig;
  }

  /**
   * Plain text / multimodal generation with streaming support.
   */
  async *generateTextStream(options: GeminiTextOptions & { tools?: any[] }): AsyncGenerator<string, void, unknown> {
    const { model = this.defaultModel, systemInstruction, config, tools } = options;
    const contents = this.buildContents(options);

    const callConfig = this.buildConfig(systemInstruction, config);
    if (tools) (callConfig as any).tools = tools;

    const streamResponse = await this.client.models.generateContentStream({
      model,
      contents,
      config: callConfig as any,
    });

    for await (const chunk of streamResponse as any) {
      const chunkText: string =
        typeof chunk.text === 'function'
          ? chunk.text()
          : (chunk?.candidates?.[0]?.content?.parts?.[0]?.text ?? '');
      if (chunkText) {
        yield chunkText;
      }
    }
  }

  /**
   * Plain text / multimodal generation with optional per-call system prompt.
   */
  async generateText(options: GeminiTextOptions): Promise<GeminiTextResult> {
    const { model = this.defaultModel, systemInstruction, config } = options;
    const contents = this.buildContents(options);

    const response =
      (await this.client.models.generateContent({
        model,
        contents,
        config: this.buildConfig(systemInstruction, config),
      })) as unknown as GeminiGenerateResponse;

    const text = this.extractFirstText(response);

    return { text, raw: response };
  }

  /**
   * Structured output helper.
   *
   * Example:
   *   interface UserProfile { name: string; age: number; }
   *   const result = await geminiService.generateStructured<UserProfile>({
   *     prompt: 'Extract a user profile from this text: ...',
   *     schema: {
   *       type: 'object',
   *       properties: {
   *         name: { type: 'string' },
   *         age: { type: 'number' },
   *       },
   *       required: ['name', 'age'],
   *     },
   *   });
   */
  async generateStructured<T>(
    options: GeminiStructuredOptions<T>,
  ): Promise<GeminiStructuredResult<T>> {
    const {
      model = this.defaultModel,
      systemInstruction,
      schema,
      mimeType = 'application/json',
      useJsonSchema = false,
      config,
      transform,
    } = options;

    const contents = this.buildContents(options);
    const baseConfig = this.buildConfig(systemInstruction, config);

    const response =
      (await this.client.models.generateContent({
        model,
        contents,
        config: {
          ...baseConfig,
          responseMimeType: mimeType,
          ...(useJsonSchema
            ? { responseJsonSchema: schema }
            : { responseSchema: schema }),
        },
      })) as unknown as GeminiGenerateResponse;

    const rawText = this.extractFirstText(response);
    let parsed: unknown;

    try {
      parsed = rawText ? JSON.parse(rawText) : null;
    } catch (err) {
      throw new Error(
        `GeminiService: Failed to parse structured JSON output: ${(err as Error).message
        }\nRaw text was:\n${rawText}`,
      );
    }

    const data = transform ? transform(parsed) : (parsed as T);

    return { data, rawText, raw: response };
  }

  /**
   * Generate content grounded in Google Search results.
   *
   * Uses the native `googleSearch` tool so the model can look up
   * up-to-date information before writing.
   *
   * @param options.contextUrls  Optional URLs to weave into the prompt as
   *   additional context (the model is asked to consider them; the search
   *   tool can follow their content).
   */
  async generateWithWebSearch(
    options: GeminiWebSearchOptions,
  ): Promise<GeminiWebSearchResult> {
    const { model = this.defaultModel, systemInstruction, config, prompt, contextUrls = [] } = options;

    const urlContext =
      contextUrls.length > 0
        ? `\n\nAlso consider information from these URLs: ${contextUrls.join(', ')}`
        : '';

    const fullPrompt = `${prompt}${urlContext}`;

    const response = (await this.client.models.generateContent({
      model,
      contents: fullPrompt,
      config: {
        ...this.buildConfig(systemInstruction, config),
        tools: [{ googleSearch: {} }, { urlContext: {} }],
      } as any,
    })) as unknown as GeminiGenerateResponse;

    const text = this.extractFirstText(response);
    const groundingMetadata = (response as any).candidates?.[0]?.groundingMetadata;

    return { text, groundingMetadata, raw: response };
  }

  /**
   * Generate content from an audio blob (e.g. voice notes recorded in the
   * browser) plus an optional text prompt.
   *
   * The audio is sent inline (base64-encoded) so no file upload is required
   * for small recordings.
   */
  async generateFromAudio(
    options: GeminiAudioOptions,
  ): Promise<GeminiTextResult> {
    const { model = this.defaultModel, systemInstruction, config, audioData, mimeType, textPrompt } = options;

    // Convert to base64 string expected by the inline-data API.
    const bytes =
      audioData instanceof ArrayBuffer ? new Uint8Array(audioData) : audioData;
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = Buffer.isBuffer(bytes)
      ? bytes.toString('base64')
      : Buffer.from(bytes as Uint8Array).toString('base64');

    const parts: any[] = [
      { inlineData: { data: base64, mimeType } },
    ];
    if (textPrompt) {
      parts.push({ text: textPrompt });
    }

    const response = (await this.client.models.generateContent({
      model,
      contents: [{ role: 'user', parts }],
      config: this.buildConfig(systemInstruction, config),
    })) as unknown as GeminiGenerateResponse;

    return { text: this.extractFirstText(response), raw: response };
  }

  /**
   * List models from the API as a simplified list.
   * Useful for admin/debug UIs or model selection interfaces.
   */
  async listModels(): Promise<GeminiModelSummary[]> {
    const pager = await this.client.models.list();
    const models: GeminiModelSummary[] = [];

    for await (const model of pager as any) {
      models.push({
        name: model.name,
        displayName: model.displayName,
        description: model.description,
        inputTokenLimit: model.inputTokenLimit,
        outputTokenLimit: model.outputTokenLimit,
        supportedGenerationMethods: model.supportedGenerationMethods,
      });
    }

    return models;
  }

  /**
   * Upload a file to the Gemini API and return a minimal, typed handle
   * that you can reference in subsequent requests (via fileData.fileUri).
   *
   * Supports:
   *  - { kind: 'path', path, mimeType? }        // Node.js file path
   *  - { kind: 'blob', blob, mimeType? }        // Blob instance
   *  - { kind: 'bytes', data, mimeType }        // raw bytes
   */
  async upload(
    source: GeminiUploadSource,
    options?: { displayName?: string },
  ): Promise<GeminiUploadedFile> {
    const { displayName } = options ?? {};

    const uploadParams: any = {
      config: {} as Record<string, unknown>,
    };

    // Determine file and mimeType based on the source kind.
    switch (source.kind) {
      case 'path': {
        uploadParams.file = source.path;
        const inferredMime = await detectMimeType(source.path, source.mimeType);
        if (inferredMime) {
          uploadParams.config.mimeType = inferredMime;
        }
        break;
      }
      case 'blob': {
        uploadParams.file = source.blob;
        if (source.mimeType) {
          uploadParams.config.mimeType = source.mimeType;
        }
        break;
      }
      case 'bytes': {
        // Normalise to a Blob so we can call the SDK in a consistent way.
        // Node.js 18+ exposes Blob globally.
        const blob = new Blob([source.data as any], { type: source.mimeType });
        uploadParams.file = blob;
        uploadParams.config.mimeType = source.mimeType;
        break;
      }
      default: {
        // Exhaustiveness check – should be unreachable.
        const _exhaustive: never = source;
        throw new Error(`Unsupported upload source: ${String(_exhaustive)}`);
      }
    }

    if (displayName) {
      uploadParams.config.displayName = displayName;
    }

    const file = await this.client.files.upload(uploadParams);

    const name: string =
      (file as any).name ?? (file as any).uri ?? 'uploaded-file';
    const uri: string = (file as any).uri ?? name;

    return {
      name,
      uri,
      mimeType: (file as any).mimeType,
      displayName: (file as any).displayName,
      sizeBytes: (file as any).sizeBytes,
    };
  }

  /**
   * Construct the final configuration for a single call by combining:
   * - global defaults
   * - per-call overrides
   * - systemInstruction (global + per-call)
   */
  private buildConfig(
    systemInstructionOverride?: string,
    perCallConfig?: GeminiGenerationOptions['config'],
  ): Record<string, unknown> {
    const merged: Record<string, unknown> = {
      ...(this.defaultGenerationConfig ?? {}),
      ...(perCallConfig ?? {}),
    };

    const effectiveSystemInstruction =
      systemInstructionOverride ?? this.defaultSystemInstruction;

    if (effectiveSystemInstruction) {
      merged.systemInstruction = {
        role: 'system',
        parts: [{ text: effectiveSystemInstruction }],
      };
    }

    return merged;
  }

  /**
   * Extract the first text part from a GenerateContent response.
   */
  private extractFirstText(response: GeminiGenerateResponse): string {
    const candidate: GeminiCandidate | undefined = response.candidates?.[0];
    const parts = candidate?.content?.parts ?? [];
    const textPart = parts.find((p) => typeof p.text === 'string');
    return textPart?.text ?? '';
  }

  /**
   * Build the `contents` array for a request based on the high-level options.
   *
   * Rules:
   *  - If `contents` is provided, convert each GeminiInputPart to the
   *    underlying Gemini `Part` shape.
   *  - If `prompt` is provided, append a final user message with that text.
   *  - If neither is provided, throw an error.
   */
  private buildContents(
    options: Pick<GeminiTextOptions, 'prompt' | 'contents'>,
  ): GeminiContent[] {
    const baseContents: GeminiContent[] = [];

    if (options.contents && options.contents.length > 0) {
      for (const content of options.contents as GeminiContentInput[]) {
        baseContents.push({
          role: content.role,
          parts: content.parts.map((part) => {
            if (part.type === 'text') {
              return { text: part.text };
            }

            if (part.type === 'file') {
              return {
                fileData: {
                  fileUri: part.fileUri,
                  mimeType: part.mimeType,
                },
              } as any;
            }

            if (part.type === 'inlineBytes') {
              const blob = new Blob([part.data as any], {
                type: part.mimeType,
              });
              return {
                inlineData: {
                  data: blob,
                  mimeType: part.mimeType,
                },
              } as any;
            }

            const _never: never = part;
            throw new Error(`Unsupported input part: ${JSON.stringify(_never)}`);
          }),
        });
      }
    }

    if (options.prompt) {
      baseContents.push({
        role: 'user',
        parts: [{ text: options.prompt }],
      });
    }

    if (baseContents.length === 0) {
      throw new Error(
        'GeminiService: either `prompt` or `contents` must be provided.',
      );
    }

    return baseContents;
  }
}

