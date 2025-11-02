/**
 * Multimodal Module
 * Handles multimodal understanding (text, image, audio, video)
 */

import type { GeminiClient } from './client';
import type {
  MultimodalOptions,
  GenerateContentResponse,
  Part,
  Content,
} from './types';

/**
 * Multimodal Understanding Manager
 */
export class Multimodal {
  constructor(private client: GeminiClient) {}

  /**
   * Analyze content with multimodal input (text + images/audio/video)
   * 
   * @param options - Multimodal analysis options
   * @returns Generated content response
   * 
   * @example
   * ```typescript
   * const response = await multimodal.analyze({
   *   prompt: "Describe what's happening in this image",
   *   media: [imageData]
   * });
   * ```
   */
  async analyze(options: MultimodalOptions): Promise<GenerateContentResponse> {
    const model = options.model || this.client.getDefaultModel();
    const defaultConfig = this.client.getConfig().defaultGenerationConfig;
    const config = {
      ...defaultConfig,
      ...options.config,
    };

    // Combine text prompt and media into content parts
    const parts: Part[] = [
      { text: options.prompt },
      ...options.media,
    ];

    const contents: Content[] = [
      {
        role: 'user',
        parts,
      },
    ];

    const params: any = {
      model,
      contents,
    };

    if (options.systemInstruction) {
      params.systemInstruction = options.systemInstruction;
    }

    if (config && Object.keys(config).length > 0) {
      params.config = config;
    }

    if (options.safetySettings && options.safetySettings.length > 0) {
      params.config = {
        ...params.config,
        safetySettings: options.safetySettings,
      };
    }

    return await this.client.models.generateContent(params);
  }

  /**
   * Analyze images with text prompt
   * 
   * @param prompt - Text prompt/question about the images
   * @param images - Array of image parts
   * @param model - Optional model to use
   * @returns Generated content response
   * 
   * @example
   * ```typescript
   * const response = await multimodal.analyzeImages(
   *   "Compare these two images",
   *   [image1, image2]
   * );
   * ```
   */
  async analyzeImages(
    prompt: string,
    images: Part[],
    model?: string
  ): Promise<GenerateContentResponse> {
    return this.analyze({
      prompt,
      media: images,
      model,
    });
  }

  /**
   * Analyze video with text prompt
   * 
   * @param prompt - Text prompt/question about the video
   * @param video - Video part
   * @param model - Optional model to use
   * @returns Generated content response
   * 
   * @example
   * ```typescript
   * const response = await multimodal.analyzeVideo(
   *   "Summarize the key events in this video",
   *   videoData
   * );
   * ```
   */
  async analyzeVideo(
    prompt: string,
    video: Part,
    model?: string
  ): Promise<GenerateContentResponse> {
    return this.analyze({
      prompt,
      media: [video],
      model,
    });
  }

  /**
   * Analyze audio with text prompt
   * 
   * @param prompt - Text prompt/question about the audio
   * @param audio - Audio part
   * @param model - Optional model to use
   * @returns Generated content response
   * 
   * @example
   * ```typescript
   * const response = await multimodal.analyzeAudio(
   *   "Transcribe this audio and summarize it",
   *   audioData
   * );
   * ```
   */
  async analyzeAudio(
    prompt: string,
    audio: Part,
    model?: string
  ): Promise<GenerateContentResponse> {
    return this.analyze({
      prompt,
      media: [audio],
      model,
    });
  }

  /**
   * Helper to create a video Part from a file URI or inline data
   * 
   * @param source - File URI or base64 data
   * @param mimeType - MIME type of the video
   * @returns Video Part object
   */
  createVideoPart(source: string, mimeType: string = 'video/mp4'): Part {
    if (source.startsWith('gs://') || source.startsWith('https://')) {
      return {
        fileData: {
          fileUri: source,
        },
      };
    }

    return {
      inlineData: {
        mimeType,
        data: source,
      },
    };
  }

  /**
   * Helper to create an audio Part from a file URI or inline data
   * 
   * @param source - File URI or base64 data
   * @param mimeType - MIME type of the audio
   * @returns Audio Part object
   */
  createAudioPart(source: string, mimeType: string = 'audio/mp3'): Part {
    if (source.startsWith('gs://') || source.startsWith('https://')) {
      return {
        fileData: {
          fileUri: source,
        },
      };
    }

    return {
      inlineData: {
        mimeType,
        data: source,
      },
    };
  }

  /**
   * Helper to create a file Part from a file URI
   * Used for files uploaded via the Files API
   * 
   * @param fileUri - URI of the uploaded file
   * @returns File Part object
   */
  createFilePart(fileUri: string): Part {
    return {
      fileData: {
        fileUri,
      },
    };
  }

  /**
   * Helper to create an inline data Part
   * 
   * @param data - Base64 encoded data
   * @param mimeType - MIME type
   * @returns Inline data Part object
   */
  createInlineDataPart(data: string, mimeType: string): Part {
    return {
      inlineData: {
        mimeType,
        data,
      },
    };
  }
}
