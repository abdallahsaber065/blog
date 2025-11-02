// Image generation utilities
import { getAIClient } from '../client';
import { GenerateImageResponse, ImageGenerationOptions } from '../types';

/**
 * Generate an image from text prompt
 * 
 * @param options - Image generation options
 * @returns Generated image data
 * 
 * @example
 * ```typescript
 * const image = await generateImage({
 *   prompt: 'A futuristic cityscape at sunset',
 *   aspectRatio: '16:9'
 * });
 * 
 * // Save to file
 * const buffer = Buffer.from(image.image_data, 'base64');
 * await fs.writeFile('output.png', buffer);
 * ```
 */
export async function generateImage(
    options: ImageGenerationOptions
): Promise<GenerateImageResponse> {
    const client = getAIClient();
    const model = (client as any).getGenerativeModel({
        model: options.model || 'gemini-2.5-flash-preview-image'
    });

    // Build the prompt parts
    const parts: any[] = [{ text: options.prompt }];

    // Add reference images if provided
    if (options.referenceImages && options.referenceImages.length > 0) {
        for (const refImage of options.referenceImages) {
            if (refImage.uri) {
                parts.push({
                    fileData: {
                        fileUri: refImage.uri,
                        mimeType: refImage.mimeType || 'image/jpeg'
                    }
                });
            } else if (refImage.data) {
                parts.push({
                    inlineData: {
                        data: refImage.data,
                        mimeType: refImage.mimeType || 'image/jpeg'
                    }
                });
            }
        }
    }

    // Generate image
    const result = await model.generateContent({
        contents: parts,
        generationConfig: {
            ...(options.aspectRatio && { aspectRatio: options.aspectRatio }),
            ...(options.numberOfImages && { numberOfImages: options.numberOfImages })
        }
    });

    // Extract image data from response
    const response = result.response;
    const candidate = response.candidates?.[0];

    if (!candidate?.content?.parts?.[0]) {
        throw new Error('No image generated');
    }

    const imagePart = candidate.content.parts[0];

    if (!imagePart.inlineData) {
        throw new Error('Invalid image response format');
    }

    return {
        image_data: imagePart.inlineData.data,
        mime_type: imagePart.inlineData.mimeType
    };
}

/**
 * Generate a blog post cover image
 * 
 * @param topic - Blog post topic
 * @param style - Visual style (e.g., "modern", "minimalist", "vibrant")
 * @param aspectRatio - Image aspect ratio
 * @returns Generated cover image
 * 
 * @example
 * ```typescript
 * const cover = await generateBlogCover(
 *   'Introduction to Machine Learning',
 *   'modern and professional',
 *   '16:9'
 * );
 * ```
 */
export async function generateBlogCover(
    topic: string,
    style: string = 'modern and professional',
    aspectRatio: '1:1' | '16:9' | '9:16' | '4:3' | '3:4' = '16:9'
): Promise<GenerateImageResponse> {
    const prompt = `Create a professional blog post cover image for: "${topic}"

Style: ${style}
Requirements:
- High quality and visually appealing
- Relevant imagery that represents the topic
- Clean and uncluttered composition
- Suitable for use as a blog thumbnail
- No text overlays
- Professional color palette`;

    return generateImage({
        prompt,
        aspectRatio
    });
}

/**
 * Edit an existing image with a prompt
 * 
 * @param imageUri - URI of the uploaded image to edit
 * @param prompt - Editing instructions
 * @param maskUri - Optional mask URI for selective editing
 * @returns Edited image
 * 
 * @example
 * ```typescript
 * const edited = await editImage(
 *   'files/abc123',
 *   'Add a sunset in the background'
 * );
 * ```
 */
export async function editImage(
    imageUri: string,
    prompt: string,
    maskUri?: string
): Promise<GenerateImageResponse> {
    const parts: any[] = [
        {
            fileData: {
                fileUri: imageUri,
                mimeType: 'image/jpeg'
            }
        },
        { text: prompt }
    ];

    // Add mask if provided
    if (maskUri) {
        parts.push({
            fileData: {
                fileUri: maskUri,
                mimeType: 'image/png'
            }
        });
    }

    const client = getAIClient();
    const model = (client as any).getGenerativeModel({
        model: 'gemini-2.5-flash-preview-image'
    });

    const result = await model.generateContent({
        contents: parts
    });

    const response = result.response;
    const candidate = response.candidates?.[0];
    const imagePart = candidate?.content?.parts?.[0];

    if (!imagePart?.inlineData) {
        throw new Error('Image editing failed');
    }

    return {
        image_data: imagePart.inlineData.data,
        mime_type: imagePart.inlineData.mimeType
    };
}

/**
 * Generate multiple variations of an image
 * 
 * @param prompt - Image description
 * @param count - Number of variations (1-4)
 * @param aspectRatio - Aspect ratio
 * @returns Array of generated images
 * 
 * @example
 * ```typescript
 * const variations = await generateImageVariations(
 *   'A serene mountain landscape',
 *   3,
 *   '16:9'
 * );
 * ```
 */
export async function generateImageVariations(
    prompt: string,
    count: number = 3,
    aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4'
): Promise<GenerateImageResponse[]> {
    const promises = Array.from({ length: Math.min(count, 4) }, () =>
        generateImage({
            prompt,
            aspectRatio,
            numberOfImages: 1
        })
    );

    return Promise.all(promises);
}

/**
 * Save generated image to file
 * 
 * @param imageResponse - Generated image response
 * @param outputPath - Path to save the image
 * 
 * @example
 * ```typescript
 * const image = await generateImage({ prompt: 'A sunset' });
 * await saveImageToFile(image, './output/sunset.png');
 * ```
 */
export async function saveImageToFile(
    imageResponse: GenerateImageResponse,
    outputPath: string
): Promise<void> {
    const fs = await import('fs');
    const buffer = Buffer.from(imageResponse.image_data, 'base64');
    await fs.promises.writeFile(outputPath, buffer as any);
}

/**
 * Convert image response to data URL
 * 
 * @param imageResponse - Generated image response
 * @returns Data URL string
 * 
 * @example
 * ```typescript
 * const image = await generateImage({ prompt: 'A cat' });
 * const dataUrl = imageToDataURL(image);
 * // Use in img src: <img src={dataUrl} />
 * ```
 */
export function imageToDataURL(imageResponse: GenerateImageResponse): string {
    return `data:${imageResponse.mime_type};base64,${imageResponse.image_data}`;
}

/**
 * Get image dimensions from base64 data
 * 
 * Note: This requires image processing library in browser/node
 * Returns estimated dimensions based on data size if library not available
 * 
 * @param imageResponse - Generated image response
 * @returns Width and height
 */
export function getImageDimensions(imageResponse: GenerateImageResponse): {
    width: number;
    height: number;
} {
    // This is a placeholder - actual implementation would use image processing
    // For now, return typical dimensions based on aspect ratio from mime type

    // Default dimensions for common aspect ratios
    const defaultDimensions: Record<string, { width: number; height: number }> = {
        '16:9': { width: 1920, height: 1080 },
        '9:16': { width: 1080, height: 1920 },
        '1:1': { width: 1024, height: 1024 },
        '4:3': { width: 1600, height: 1200 },
        '3:4': { width: 1200, height: 1600 }
    };

    // Return default 16:9 dimensions
    return defaultDimensions['16:9'];
}

/**
 * Validate image generation prompt
 * 
 * @param prompt - The image prompt to validate
 * @returns Validation result
 */
export function validateImagePrompt(prompt: string): {
    valid: boolean;
    issues: string[];
} {
    const issues: string[] = [];

    if (!prompt || prompt.trim().length === 0) {
        issues.push('Prompt cannot be empty');
    }

    if (prompt.length < 10) {
        issues.push('Prompt is too short (minimum 10 characters)');
    }

    if (prompt.length > 1000) {
        issues.push('Prompt is too long (maximum 1000 characters)');
    }

    return {
        valid: issues.length === 0,
        issues
    };
}

/**
 * Build an enhanced image prompt with style modifiers
 * 
 * @param basePrompt - Base image description
 * @param options - Style and quality options
 * @returns Enhanced prompt
 * 
 * @example
 * ```typescript
 * const prompt = buildEnhancedPrompt('A mountain landscape', {
 *   style: 'photorealistic',
 *   mood: 'serene and peaceful',
 *   quality: 'high detail'
 * });
 * ```
 */
export function buildEnhancedPrompt(
    basePrompt: string,
    options?: {
        style?: string;
        mood?: string;
        quality?: string;
        lighting?: string;
        color?: string;
    }
): string {
    const modifiers: string[] = [basePrompt];

    if (options?.style) {
        modifiers.push(`Style: ${options.style}`);
    }

    if (options?.mood) {
        modifiers.push(`Mood: ${options.mood}`);
    }

    if (options?.lighting) {
        modifiers.push(`Lighting: ${options.lighting}`);
    }

    if (options?.color) {
        modifiers.push(`Color palette: ${options.color}`);
    }

    if (options?.quality) {
        modifiers.push(options.quality);
    }

    return modifiers.join(', ');
}
