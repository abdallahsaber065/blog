/**
 * Unified storage interface - swap between local disk and S3
 * by setting STORAGE_PROVIDER=local|s3 in your .env
 */

export interface UploadResult {
  /** The key/path stored in the database, e.g. "uploads/media/abc.webp" */
  file_url: string;
  /** Publicly resolvable URL, e.g. "http://localhost:3444/uploads/media/abc.webp" or "https://bucket.s3.amazonaws.com/..." */
  public_url: string;
  file_name: string;
  file_type: string;
  file_size: number;
}

export interface DeleteResult {
  success: boolean;
}

export interface StorageProvider {
  /**
   * Upload a file buffer.
   * @param buffer   Raw file bytes
   * @param key      Destination path within storage, e.g. "uploads/media/abc.webp"
   * @param mimeType e.g. "image/webp"
   */
  upload(buffer: Buffer, key: string, mimeType: string): Promise<UploadResult>;

  /**
   * Delete a file by its stored key.
   */
  delete(key: string): Promise<DeleteResult>;

  /**
   * Convert a stored key/path into a publicly accessible URL.
   * Used by the API responses and the frontend.
   */
  getPublicUrl(key: string): string;
}
