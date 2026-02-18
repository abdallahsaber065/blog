/**
 * React hook for image conversion to WebP
 * Provides easy-to-use interface for image uploads with automatic WebP conversion
 */

import { useState, useCallback } from 'react';
import {
  convertImageToWebP,
  convertMultipleImagesToWebP,
  validateImageFile,
  ConversionOptions,
  ConversionResult,
} from '@/lib/imageConverter';

export interface UseImageConverterOptions extends ConversionOptions {
  maxFileSize?: number;
  allowedTypes?: string[];
  autoConvert?: boolean;
}

export interface UseImageConverterReturn {
  converting: boolean;
  error: string | null;
  convertImage: (file: File) => Promise<ConversionResult | null>;
  convertImages: (files: File[]) => Promise<ConversionResult[]>;
  resetError: () => void;
}

/**
 * Hook for converting images to WebP format
 * @param options - Conversion options
 * @returns Conversion utilities and state
 */
export function useImageConverter(
  options: UseImageConverterOptions = {}
): UseImageConverterReturn {
  const [converting, setConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    maxFileSize = 10 * 1024 * 1024, // 10MB default
    allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
    autoConvert = true,
    ...conversionOptions
  } = options;

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  const convertImage = useCallback(
    async (file: File): Promise<ConversionResult | null> => {
      setError(null);
      setConverting(true);

      try {
        // Validate file
        const validation = validateImageFile(file, maxFileSize, allowedTypes);
        if (!validation.valid) {
          setError(validation.error || 'Invalid file');
          return null;
        }

        // Convert to WebP if autoConvert is enabled
        if (!autoConvert) {
          return {
            file,
            originalSize: file.size,
            compressedSize: file.size,
            savings: 0,
            success: true,
          };
        }

        const result = await convertImageToWebP(file, conversionOptions);

        if (!result.success) {
          setError(result.error || 'Conversion failed');
          return null;
        }

        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
        console.error('Image conversion error:', err);
        return null;
      } finally {
        setConverting(false);
      }
    },
    [maxFileSize, allowedTypes, autoConvert, conversionOptions]
  );

  const convertImages = useCallback(
    async (files: File[]): Promise<ConversionResult[]> => {
      setError(null);
      setConverting(true);

      try {
        // Validate all files first
        for (const file of files) {
          const validation = validateImageFile(file, maxFileSize, allowedTypes);
          if (!validation.valid) {
            setError(validation.error || 'Invalid file');
            throw new Error(validation.error);
          }
        }

        // Convert all files
        const results = await convertMultipleImagesToWebP(files, conversionOptions);

        // Check for any failures
        const failures = results.filter(r => !r.success);
        if (failures.length > 0) {
          setError(`${failures.length} file(s) failed to convert`);
        }

        return results;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
        console.error('Batch image conversion error:', err);
        return [];
      } finally {
        setConverting(false);
      }
    },
    [maxFileSize, allowedTypes, conversionOptions]
  );

  return {
    converting,
    error,
    convertImage,
    convertImages,
    resetError,
  };
}
