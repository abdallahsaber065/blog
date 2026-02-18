import path from 'path';
import type { StorageProvider, UploadResult, DeleteResult } from './types';

/**
 * AWS S3 (or any S3-compatible) storage provider.
 *
 * ENV vars consumed:
 *   STORAGE_S3_BUCKET          –  bucket name (required)
 *   STORAGE_S3_REGION          –  e.g. "us-east-1"          (required)
 *   AWS_ACCESS_KEY_ID          –  IAM key                   (required)
 *   AWS_SECRET_ACCESS_KEY      –  IAM secret                (required)
 *   STORAGE_S3_ENDPOINT        –  custom endpoint for MinIO / R2 / etc. (optional)
 *   STORAGE_S3_PUBLIC_URL      –  CDN or custom domain base URL        (optional)
 *                                 Falls back to https://<bucket>.s3.<region>.amazonaws.com
 *   STORAGE_S3_FORCE_PATH_STYLE –  "true" for MinIO / LocalStack       (optional)
 *
 * Install the SDK with:  pnpm add @aws-sdk/client-s3
 */
export class S3StorageProvider implements StorageProvider {
  private bucket: string;
  private region: string;
  private publicUrlBase: string;

  // Lazy-loaded so the module can be imported without the SDK present
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private clientPromise: Promise<any> | null = null;

  constructor() {
    this.bucket = process.env.STORAGE_S3_BUCKET || '';
    this.region = process.env.STORAGE_S3_REGION || 'us-east-1';

    const customBase = (process.env.STORAGE_S3_PUBLIC_URL || '').replace(/\/$/, '');
    this.publicUrlBase =
      customBase ||
      `https://${this.bucket}.s3.${this.region}.amazonaws.com`;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async getClient(): Promise<any> {
    if (!this.clientPromise) {
      this.clientPromise = (async () => {
        // Dynamic import so the build does not fail if SDK is not installed
        const { S3Client } = await import('@aws-sdk/client-s3');

        const options: Record<string, unknown> = {
          region: this.region,
          credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
          },
        };

        if (process.env.STORAGE_S3_ENDPOINT) {
          options.endpoint = process.env.STORAGE_S3_ENDPOINT;
        }

        if (process.env.STORAGE_S3_FORCE_PATH_STYLE === 'true') {
          options.forcePathStyle = true;
        }

        return new S3Client(options);
      })();
    }
    return this.clientPromise;
  }

  async upload(buffer: Buffer, key: string, mimeType: string): Promise<UploadResult> {
    const client = await this.getClient();
    const { PutObjectCommand } = await import('@aws-sdk/client-s3');

    await client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
        // For public-read buckets; remove if using pre-signed URLs instead
        ...(process.env.STORAGE_S3_ACL ? { ACL: process.env.STORAGE_S3_ACL } : {}),
      }),
    );

    const fileName = path.basename(key);
    return {
      file_url: key,
      public_url: this.getPublicUrl(key),
      file_name: fileName,
      file_type: mimeType,
      file_size: buffer.byteLength,
    };
  }

  async delete(key: string): Promise<DeleteResult> {
    try {
      const client = await this.getClient();
      const { DeleteObjectCommand } = await import('@aws-sdk/client-s3');

      await client.send(
        new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
      );
      return { success: true };
    } catch {
      return { success: false };
    }
  }

  getPublicUrl(key: string): string {
    const clean = key.replace(/^\/+/, '');
    return `${this.publicUrlBase}/${clean}`;
  }
}
