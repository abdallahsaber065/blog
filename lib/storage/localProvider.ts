import fs from 'fs';
import path from 'path';
import type { StorageProvider, UploadResult, DeleteResult } from './types';

/**
 * Local-disk storage provider.
 * Files are written under  <cwd>/public/<key>
 * and served by Next.js as static assets at  /<key>
 *
 * ENV vars consumed:
 *   NEXT_PUBLIC_BASE_URL  –  e.g. "http://localhost:3444"
 */
export class LocalStorageProvider implements StorageProvider {
  private publicRoot: string;
  private baseUrl: string;

  constructor() {
    this.publicRoot = path.join(process.cwd(), 'public');
    // Trim any trailing slash so getPublicUrl always produces clean URLs.
    this.baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || '').replace(/\/$/, '');
  }

  async upload(buffer: Buffer, key: string, mimeType: string): Promise<UploadResult> {
    const dest = path.join(this.publicRoot, key);
    // Ensure directory exists
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, buffer);

    return {
      file_url: key,                       // stored in DB  - relative, no leading slash
      public_url: this.getPublicUrl(key),  // returned to client
      file_name: path.basename(key),
      file_type: mimeType,
      file_size: buffer.byteLength,
    };
  }

  async delete(key: string): Promise<DeleteResult> {
    try {
      const filePath = path.join(this.publicRoot, key);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return { success: true };
    } catch {
      return { success: false };
    }
  }

  getPublicUrl(key: string): string {
    // key is already a relative path like "uploads/media/abc.webp"
    // strip any accidental leading slash to avoid double-slash
    const clean = key.replace(/^\/+/, '');
    return `${this.baseUrl}/${clean}`;
  }
}
