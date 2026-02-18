/**
 * Client-side WebP image conversion utility
 * Uses browser-image-compression library for efficient conversion
 */

import imageCompression from 'browser-image-compression';

export interface ConversionOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  useWebWorker?: boolean;
  quality?: number;
  convertToWebP?: boolean;
}

export interface ConversionResult {
  file: File;
  originalSize: number;
  compressedSize: number;
  savings: number;
  success: boolean;
  error?: string;
}

const DEFAULT_OPTIONS: ConversionOptions = {
  maxSizeMB: 2,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
  quality: 0.8,
  convertToWebP: true,
};

/**
 * Convert an image file to WebP format with compression
 * @param file - The image file to convert
 * @param options - Conversion options
 * @returns Promise with conversion result
 */
export async function convertImageToWebP(
  file: File,
  options: ConversionOptions = {}
): Promise<ConversionResult> {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
  const originalSize = file.size;

  try {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }

    // If it's already WebP and no other options set, return as is
    if (file.type === 'image/webp' && !mergedOptions.maxSizeMB) {
      return {
        file,
        originalSize,
        compressedSize: file.size,
        savings: 0,
        success: true,
      };
    }

    // Prepare compression options
    const compressionOptions = {
      maxSizeMB: mergedOptions.maxSizeMB || 2,
      maxWidthOrHeight: mergedOptions.maxWidthOrHeight || 1920,
      useWebWorker: mergedOptions.useWebWorker !== false,
      fileType: mergedOptions.convertToWebP ? 'image/webp' : file.type,
      initialQuality: mergedOptions.quality || 0.8,
    };

    // Compress and convert
    const compressedFile = await imageCompression(file, compressionOptions);

    // Generate new filename with .webp extension if converted
    let newFileName = file.name;
    if (mergedOptions.convertToWebP) {
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
      newFileName = `${nameWithoutExt}.webp`;
    }

    // Create new File object with correct name
    const resultFile = new File([compressedFile], newFileName, {
      type: compressedFile.type,
      lastModified: Date.now(),
    });

    const compressedSize = resultFile.size;
    const savings = ((originalSize - compressedSize) / originalSize) * 100;

    return {
      file: resultFile,
      originalSize,
      compressedSize,
      savings: Math.max(0, savings),
      success: true,
    };
  } catch (error) {
    console.error('Image conversion error:', error);
    return {
      file,
      originalSize,
      compressedSize: file.size,
      savings: 0,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Convert multiple images to WebP format
 * @param files - Array of image files to convert
 * @param options - Conversion options
 * @returns Promise with array of conversion results
 */
export async function convertMultipleImagesToWebP(
  files: File[],
  options: ConversionOptions = {}
): Promise<ConversionResult[]> {
  const promises = files.map(file => convertImageToWebP(file, options));
  return Promise.all(promises);
}

/**
 * Get a preview URL for an image file
 * @param file - The image file
 * @returns Preview URL (must be revoked after use)
 */
export function getImagePreview(file: File): string {
  return URL.createObjectURL(file);
}

/**
 * Revoke a preview URL to free memory
 * @param url - The preview URL to revoke
 */
export function revokeImagePreview(url: string): void {
  URL.revokeObjectURL(url);
}

/**
 * Validate image file
 * @param file - File to validate
 * @param maxSize - Maximum file size in bytes (default: 10MB)
 * @param allowedTypes - Allowed MIME types
 * @returns Validation result
 */
export function validateImageFile(
  file: File,
  maxSize: number = 10 * 1024 * 1024,
  allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'File must be an image' };
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} not allowed. Allowed types: ${allowedTypes.join(', ')}`,
    };
  }

  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / 1024 / 1024).toFixed(2);
    const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);
    return {
      valid: false,
      error: `File size (${fileSizeMB}MB) exceeds maximum allowed size (${maxSizeMB}MB)`,
    };
  }

  return { valid: true };
}

/**
 * Format file size for display
 * @param bytes - Size in bytes
 * @returns Formatted string (e.g., "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Check if browser supports WebP
 * @returns Promise resolving to boolean
 */
export async function supportsWebP(): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img.width > 0 && img.height > 0);
    img.onerror = () => resolve(false);
    img.src = 'data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==';
  });
}
