// Files API utilities for uploading and managing files
import fs from 'fs';
import path from 'path';
import { getAIClient } from '../client';
import { FileUploadOptions, UploadedFile } from '../types';

/**
 * Get file manager from client
 * 
 * @returns File manager for file operations
 */
export function getFileManager() {
    const client = getAIClient();
    return (client as any).fileManager || (client as any).files;
}

/**
 * Determine MIME type from file extension
 * 
 * @param filePath - Path to file
 * @returns MIME type string
 */
function getMimeType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes: Record<string, string> = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.pdf': 'application/pdf',
        '.txt': 'text/plain',
        '.md': 'text/markdown',
        '.json': 'application/json',
        '.mp4': 'video/mp4',
        '.mp3': 'audio/mpeg',
        '.wav': 'audio/wav'
    };
    return mimeTypes[ext] || 'application/octet-stream';
}

/**
 * Upload a file to Google AI Files API
 * 
 * @param options - File upload options
 * @returns Uploaded file metadata
 * 
 * @example
 * ```typescript
 * const file = await uploadFile({
 *   file: '/path/to/image.jpg',
 *   displayName: 'Product Image'
 * });
 * 
 * console.log('File URI:', file.uri);
 * ```
 */
export async function uploadFile(options: FileUploadOptions): Promise<UploadedFile> {
    const fileManager = getFileManager();

    // Determine MIME type if not provided
    const mimeType = options.mimeType || getMimeType(options.file);

    // Upload the file
    const uploadResult = await fileManager.uploadFile(options.file, {
        mimeType,
        displayName: options.displayName || path.basename(options.file)
    });

    return {
        name: uploadResult.file.name,
        uri: uploadResult.file.uri,
        mimeType: uploadResult.file.mimeType,
        sizeBytes: uploadResult.file.sizeBytes,
        createTime: uploadResult.file.createTime,
        expirationTime: uploadResult.file.expirationTime
    };
}

/**
 * Upload multiple files in parallel
 * 
 * @param files - Array of file paths or upload options
 * @returns Array of uploaded file metadata
 * 
 * @example
 * ```typescript
 * const files = await uploadMultipleFiles([
 *   '/path/to/image1.jpg',
 *   '/path/to/image2.jpg',
 *   { file: '/path/to/doc.pdf', displayName: 'Documentation' }
 * ]);
 * ```
 */
export async function uploadMultipleFiles(
    files: Array<string | FileUploadOptions>
): Promise<UploadedFile[]> {
    const uploads = files.map(file => {
        if (typeof file === 'string') {
            return uploadFile({ file });
        }
        return uploadFile(file);
    });

    return Promise.all(uploads);
}

/**
 * Get file metadata by name
 * 
 * @param fileName - The file name (e.g., 'files/abc123')
 * @returns File metadata
 * 
 * @example
 * ```typescript
 * const file = await getFile('files/abc123');
 * console.log('Expiration:', file.expirationTime);
 * ```
 */
export async function getFile(fileName: string): Promise<UploadedFile> {
    const fileManager = getFileManager();
    const file = await fileManager.getFile(fileName);

    return {
        name: file.name,
        uri: file.uri,
        mimeType: file.mimeType,
        sizeBytes: file.sizeBytes,
        createTime: file.createTime,
        expirationTime: file.expirationTime
    };
}

/**
 * List all uploaded files
 * 
 * @param pageSize - Number of files per page
 * @returns Array of file metadata
 * 
 * @example
 * ```typescript
 * const files = await listFiles();
 * console.log(`You have ${files.length} files uploaded`);
 * ```
 */
export async function listFiles(pageSize: number = 100): Promise<UploadedFile[]> {
    const fileManager = getFileManager();
    const listResult = await fileManager.listFiles({ pageSize });

    return listResult.files.map((file: any) => ({
        name: file.name,
        uri: file.uri,
        mimeType: file.mimeType,
        sizeBytes: file.sizeBytes,
        createTime: file.createTime,
        expirationTime: file.expirationTime
    }));
}

/**
 * Delete a file from Files API
 * 
 * @param fileName - The file name to delete
 * 
 * @example
 * ```typescript
 * await deleteFile('files/abc123');
 * console.log('File deleted');
 * ```
 */
export async function deleteFile(fileName: string): Promise<void> {
    const fileManager = getFileManager();
    await fileManager.deleteFile(fileName);
}

/**
 * Delete multiple files in parallel
 * 
 * @param fileNames - Array of file names to delete
 * 
 * @example
 * ```typescript
 * await deleteMultipleFiles([
 *   'files/abc123',
 *   'files/def456'
 * ]);
 * ```
 */
export async function deleteMultipleFiles(fileNames: string[]): Promise<void> {
    await Promise.all(fileNames.map(name => deleteFile(name)));
}

/**
 * Wait for file to be processed and ready
 * 
 * @param fileName - The file name to wait for
 * @param maxWaitTime - Maximum time to wait in milliseconds
 * @returns File metadata when ready
 * 
 * @example
 * ```typescript
 * const uploaded = await uploadFile({ file: 'video.mp4' });
 * const ready = await waitForFileProcessing(uploaded.name);
 * // Now file is ready to use in generation
 * ```
 */
export async function waitForFileProcessing(
    fileName: string,
    maxWaitTime: number = 60000
): Promise<UploadedFile> {
    const startTime = Date.now();
    const pollInterval = 2000; // Poll every 2 seconds

    while (Date.now() - startTime < maxWaitTime) {
        const file = await getFile(fileName);

        // Check if file has a state property (some file types need processing)
        // If no state property or state is ACTIVE, file is ready
        if (!(file as any).state || (file as any).state === 'ACTIVE') {
            return file;
        }

        // Wait before polling again
        await new Promise(resolve => setTimeout(resolve, pollInterval));
    }

    throw new Error(`File processing timeout after ${maxWaitTime}ms`);
}

/**
 * Create file data part for model input
 * 
 * @param file - Uploaded file metadata
 * @returns File data part for content
 * 
 * @example
 * ```typescript
 * const uploaded = await uploadFile({ file: 'image.jpg' });
 * const filePart = createFileDataPart(uploaded);
 * 
 * const result = await model.generateContent({
 *   contents: [
 *     { text: 'Describe this image' },
 *     filePart
 *   ]
 * });
 * ```
 */
export function createFileDataPart(file: UploadedFile) {
    return {
        fileData: {
            mimeType: file.mimeType,
            fileUri: file.uri
        }
    };
}

/**
 * Create inline data part from base64
 * 
 * @param base64Data - Base64 encoded data
 * @param mimeType - MIME type of the data
 * @returns Inline data part for content
 * 
 * @example
 * ```typescript
 * const imagePart = createInlineDataPart(base64Image, 'image/jpeg');
 * 
 * const result = await model.generateContent({
 *   contents: [
 *     { text: 'What is in this image?' },
 *     imagePart
 *   ]
 * });
 * ```
 */
export function createInlineDataPart(base64Data: string, mimeType: string) {
    return {
        inlineData: {
            mimeType,
            data: base64Data
        }
    };
}

/**
 * Convert local file to inline data part
 * 
 * @param filePath - Path to local file
 * @param mimeType - Optional MIME type (auto-detected if not provided)
 * @returns Inline data part
 * 
 * @example
 * ```typescript
 * const imagePart = await fileToInlineData('/path/to/image.jpg');
 * ```
 */
export async function fileToInlineData(
    filePath: string,
    mimeType?: string
): Promise<any> {
    const buffer = await fs.promises.readFile(filePath);
    const base64 = buffer.toString('base64');
    const type = mimeType || getMimeType(filePath);

    return createInlineDataPart(base64, type);
}

/**
 * Check if file is expired
 * 
 * @param file - File metadata
 * @returns True if file is expired
 */
export function isFileExpired(file: UploadedFile): boolean {
    if (!file.expirationTime) return false;
    return new Date(file.expirationTime) < new Date();
}

/**
 * Get file size in human-readable format
 * 
 * @param sizeBytes - Size in bytes
 * @returns Formatted string (e.g., "1.5 MB")
 */
export function formatFileSize(sizeBytes?: number): string {
    if (!sizeBytes) return 'Unknown size';

    const units = ['B', 'KB', 'MB', 'GB'];
    let size = sizeBytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
}

/**
 * Clean up expired files
 * 
 * @returns Number of files deleted
 * 
 * @example
 * ```typescript
 * const deleted = await cleanupExpiredFiles();
 * console.log(`Cleaned up ${deleted} expired files`);
 * ```
 */
export async function cleanupExpiredFiles(): Promise<number> {
    const files = await listFiles();
    const expiredFiles = files.filter(isFileExpired);

    if (expiredFiles.length > 0) {
        await deleteMultipleFiles(expiredFiles.map(f => f.name));
    }

    return expiredFiles.length;
}

/**
 * Supported file MIME types for different content types
 */
export const SupportedMimeTypes = {
    images: [
        'image/png',
        'image/jpeg',
        'image/webp',
        'image/heic',
        'image/heif'
    ],
    videos: [
        'video/mp4',
        'video/mpeg',
        'video/mov',
        'video/avi',
        'video/x-flv',
        'video/mpg',
        'video/webm',
        'video/wmv',
        'video/3gpp'
    ],
    audio: [
        'audio/wav',
        'audio/mp3',
        'audio/aiff',
        'audio/aac',
        'audio/ogg',
        'audio/flac'
    ],
    documents: [
        'application/pdf',
        'text/plain',
        'text/html',
        'text/css',
        'text/javascript',
        'application/x-javascript',
        'text/x-typescript',
        'application/x-typescript',
        'text/csv',
        'text/markdown',
        'text/x-python',
        'application/x-python-code',
        'application/json',
        'text/xml',
        'application/rtf',
        'text/rtf'
    ]
};

/**
 * Check if MIME type is supported
 * 
 * @param mimeType - MIME type to check
 * @returns True if supported
 */
export function isSupportedMimeType(mimeType: string): boolean {
    return Object.values(SupportedMimeTypes)
        .flat()
        .includes(mimeType);
}
