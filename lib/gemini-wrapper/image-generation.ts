/**
 * Image Generation Module
 * Handles image generation and editing capabilities
 */

import type { GeminiClient } from './client';
import type {
  ImageGenerationOptions,
  ImageEditOptions,
  GenerateImagesResponse,
  EditImageResponse,
  Part,
} from './types';

/**
 * Image Generation Manager
 */
export class ImageGeneration {
  constructor(private client: GeminiClient) {}

  /**
   * Generate images from text prompt
   * 
   * @param options - Image generation options
   * @returns Generated images response
   * 
   * @example
   * ```typescript
   * const response = await imageGen.generate({
   *   prompt: "A serene mountain landscape at sunset",
   *   numberOfImages: 2,
   *   aspectRatio: "16:9"
   * });
   * 
   * for (const image of response.images) {
   *   console.log(image.uri);
   * }
   * ```
   */
  async generate(options: ImageGenerationOptions): Promise<GenerateImagesResponse> {
    const model = options.model || this.client.getDefaultImageModel();

    const params: any = {
      model,
      prompt: options.prompt,
    };

    // Add optional parameters
    if (options.numberOfImages !== undefined) {
      params.numberOfImages = Math.min(Math.max(options.numberOfImages, 1), 4);
    }

    if (options.aspectRatio) {
      params.aspectRatio = options.aspectRatio;
    }

    if (options.negativePrompt) {
      params.negativePrompt = options.negativePrompt;
    }

    if (options.referenceImage) {
      params.referenceImages = [options.referenceImage];
    }

    if (options.config && Object.keys(options.config).length > 0) {
      params.config = {
        ...params.config,
        ...options.config,
      };
    }

    if (options.safetySettings && options.safetySettings.length > 0) {
      params.config = {
        ...params.config,
        safetySettings: options.safetySettings,
      };
    }

    return await this.client.models.generateImages(params);
  }

  /**
   * Edit an existing image
   * 
   * @param options - Image editing options
   * @returns Edited image response
   * 
   * @example
   * ```typescript
   * const response = await imageGen.edit({
   *   image: imageData,
   *   prompt: "Add a rainbow in the sky",
   *   mask: maskData
   * });
   * ```
   */
  async edit(options: ImageEditOptions): Promise<EditImageResponse> {
    const model = options.model || this.client.getDefaultImageModel();

    const params: any = {
      model,
      image: options.image,
      prompt: options.prompt,
    };

    if (options.mask) {
      params.mask = options.mask;
    }

    if (options.referenceImage) {
      params.referenceImage = options.referenceImage;
    }

    if (options.config && Object.keys(options.config).length > 0) {
      params.config = {
        ...params.config,
        ...options.config,
      };
    }

    if (options.safetySettings && options.safetySettings.length > 0) {
      params.config = {
        ...params.config,
        safetySettings: options.safetySettings,
      };
    }

    return await this.client.models.editImage(params);
  }

  /**
   * Helper to create an image Part from a file path or URL
   * 
   * @param source - File path, URL, or base64 data
   * @param mimeType - MIME type of the image
   * @returns Image Part object
   */
  createImagePart(source: string, mimeType: string = 'image/jpeg'): Part {
    // Check if it's a URL
    if (source.startsWith('http://') || source.startsWith('https://')) {
      return {
        fileData: {
          fileUri: source,
        },
      };
    }

    // Check if it's base64 data
    if (source.startsWith('data:')) {
      const [dataPrefix, base64Data] = source.split(',');
      const mimeMatch = dataPrefix.match(/data:([^;]+)/);
      const detectedMimeType = mimeMatch ? mimeMatch[1] : mimeType;

      return {
        inlineData: {
          mimeType: detectedMimeType,
          data: base64Data,
        },
      };
    }

    // Assume it's inline base64 without prefix
    return {
      inlineData: {
        mimeType,
        data: source,
      },
    };
  }

  /**
   * Helper to create multiple image parts
   * 
   * @param sources - Array of file paths, URLs, or base64 data
   * @param mimeType - Default MIME type
   * @returns Array of image Part objects
   */
  createImageParts(sources: string[], mimeType: string = 'image/jpeg'): Part[] {
    return sources.map(source => this.createImagePart(source, mimeType));
  }
}
