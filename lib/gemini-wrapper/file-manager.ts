/**
 * File Handling Module
 * Manages file uploads and operations via the Files API
 */

import type { GeminiClient } from './client';
import type {
  FileUploadOptions,
  File,
  Part,
  UploadFileParameters,
  DownloadFileParameters,
} from './types';

/**
 * File Manager
 */
export class FileManager {
  constructor(private client: GeminiClient) {}

  /**
   * Upload a file to the Gemini API
   * Note: Only available for Gemini Developer API, not Vertex AI
   * 
   * @param options - File upload options
   * @returns Uploaded file metadata
   * 
   * @example
   * ```typescript
   * const file = await fileManager.upload({
   *   file: "/path/to/video.mp4",
   *   mimeType: "video/mp4",
   *   displayName: "My Video"
   * });
   * 
   * console.log(file.uri);
   * ```
   */
  async upload(options: FileUploadOptions): Promise<File> {
    if (this.client.isVertexAI()) {
      throw new Error('File upload is only supported in Gemini Developer API, not Vertex AI');
    }

    const uploadParams: UploadFileParameters = {
      file: options.file,
    };

    if (options.mimeType || options.displayName) {
      uploadParams.config = {};
      if (options.mimeType) {
        uploadParams.config.mimeType = options.mimeType;
      }
      if (options.displayName) {
        uploadParams.config.displayName = options.displayName;
      }
    }

    return await this.client.files.upload(uploadParams);
  }

  /**
   * Get file metadata by URI or name
   * 
   * @param nameOrUri - File name or URI
   * @returns File metadata
   * 
   * @example
   * ```typescript
   * const file = await fileManager.get("files/abc123");
   * ```
   */
  async get(nameOrUri: string): Promise<File> {
    return await this.client.files.get({ name: nameOrUri });
  }

  /**
   * List uploaded files
   * 
   * @param pageSize - Number of files per page
   * @param pageToken - Token for pagination
   * @returns List of files
   * 
   * @example
   * ```typescript
   * const response = await fileManager.list(10);
   * for (const file of response.files) {
   *   console.log(file.displayName);
   * }
   * ```
   */
  async list(pageSize?: number, pageToken?: string) {
    const params: any = {};

    if (pageSize) {
      params.pageSize = pageSize;
    }

    if (pageToken) {
      params.pageToken = pageToken;
    }

    return await this.client.files.list(params);
  }

  /**
   * Delete a file by URI or name
   * 
   * @param nameOrUri - File name or URI
   * 
   * @example
   * ```typescript
   * await fileManager.delete("files/abc123");
   * ```
   */
  async delete(nameOrUri: string): Promise<void> {
    await this.client.files.delete({ name: nameOrUri });
  }

  /**
   * Wait for a file to be processed and ready
   * Polls the file status until it's ACTIVE or fails
   * 
   * @param nameOrUri - File name or URI
   * @param pollInterval - Interval in milliseconds between polls (default: 2000)
   * @param maxAttempts - Maximum number of polling attempts (default: 30)
   * @returns File metadata when ready
   * 
   * @example
   * ```typescript
   * const file = await fileManager.upload({ file: videoPath });
   * const readyFile = await fileManager.waitForProcessing(file.name);
   * ```
   */
  async waitForProcessing(
    nameOrUri: string,
    pollInterval: number = 2000,
    maxAttempts: number = 30
  ): Promise<File> {
    let attempts = 0;

    while (attempts < maxAttempts) {
      const file = await this.get(nameOrUri);

      if (file.state === 'ACTIVE') {
        return file;
      }

      if (file.state === 'FAILED') {
        throw new Error(`File processing failed: ${file.error?.message || 'Unknown error'}`);
      }

      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, pollInterval));
      attempts++;
    }

    throw new Error(`File processing timeout after ${maxAttempts} attempts`);
  }

  /**
   * Upload a file and wait for it to be ready
   * Combines upload and waitForProcessing
   * 
   * @param options - File upload options
   * @param pollInterval - Interval in milliseconds between polls
   * @param maxAttempts - Maximum number of polling attempts
   * @returns Processed file metadata
   * 
   * @example
   * ```typescript
   * const file = await fileManager.uploadAndWait({
   *   file: "/path/to/large-video.mp4",
   *   mimeType: "video/mp4"
   * });
   * ```
   */
  async uploadAndWait(
    options: FileUploadOptions,
    pollInterval?: number,
    maxAttempts?: number
  ): Promise<File> {
    const file = await this.upload(options);
    if (!file.name) {
      throw new Error('Uploaded file has no name');
    }
    return await this.waitForProcessing(file.name, pollInterval, maxAttempts);
  }

  /**
   * Create a Part object from an uploaded file
   * 
   * @param file - File metadata or URI
   * @returns Part object for use in content
   * 
   * @example
   * ```typescript
   * const file = await fileManager.upload({ file: videoPath });
   * const part = fileManager.createPartFromFile(file);
   * 
   * // Use in generation
   * const response = await textGen.generate({
   *   prompt: "Describe this video",
   *   media: [part]
   * });
   * ```
   */
  createPartFromFile(file: File | string): Part {
    const uri = typeof file === 'string' ? file : (file.uri || '');
    return {
      fileData: {
        fileUri: uri,
      },
    };
  }

  /**
   * Download a file from the API
   * Note: This may not be available for all file types/locations
   * 
   * @param nameOrUri - File name or URI
   * @param destinationPath - Local path to save the file
   * 
   * @example
   * ```typescript
   * await fileManager.download("files/abc123", "/local/path/file.mp4");
   * ```
   */
  async download(nameOrUri: string, destinationPath: string): Promise<void> {
    const params: DownloadFileParameters = {
      file: nameOrUri,
      downloadPath: destinationPath,
    };
    await this.client.files.download(params);
  }
}
