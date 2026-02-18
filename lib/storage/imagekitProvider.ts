import path from 'path';
import type { StorageProvider, UploadResult, DeleteResult } from './types';

/**
 * ImageKit storage provider - server-side uploads via Upload API v1.
 *
 * Nested folder structure under the project root:
 *
 *   Local key:    uploads/media/abc.webp, uploads/files/doc.pdf, uploads/avatars/xyz.webp
 *   IK folder:    /{IMAGEKIT_FOLDER}/media          → blog images
 *                 /{IMAGEKIT_FOLDER}/files          → uploaded documents
 *                 /{IMAGEKIT_FOLDER}/avatars        → profile images
 *   IK filePath:  /my-blog/media/abc.webp
 *   Stored key:   my-blog/media/abc.webp
 *   Public URL:   https://ik.imagekit.io/your_id/my-blog/media/abc.webp
 *
 * The second segment of the storage key (e.g. "media" in "uploads/media/abc.webp")
 * becomes the subfolder inside the root folder in ImageKit.
 *
 * ENV vars:
 *   IMAGEKIT_PRIVATE_KEY   – Private key (server-only, never expose to client)  [required]
 *   IMAGEKIT_PUBLIC_KEY    – Public key                                          [required]
 *   IMAGEKIT_URL_ENDPOINT  – e.g. https://ik.imagekit.io/your_imagekit_id       [required]
 *   IMAGEKIT_FOLDER        – Root folder for this project, e.g. "my-blog"       [optional, default: "uploads"]
 */
export class ImageKitStorageProvider implements StorageProvider {
  private readonly privateKey: string;
  private readonly urlEndpoint: string;
  /** Root folder in the ImageKit media library - no leading/trailing slashes. */
  private readonly rootFolder: string;

  constructor() {
    this.privateKey = process.env.IMAGEKIT_PRIVATE_KEY || '';
    this.urlEndpoint = (process.env.IMAGEKIT_URL_ENDPOINT || '').replace(/\/$/, '');

    // Normalise: strip leading & trailing slashes, default to "uploads"
    this.rootFolder = (process.env.IMAGEKIT_FOLDER || 'uploads')
      .replace(/^\/+|\/+$/g, '');
  }

  // ─── helpers ────────────────────────────────────────────────────────────────

  private get credentials(): string {
    return Buffer.from(`${this.privateKey}:`).toString('base64');
  }

  /**
   * Maps the storage key's subfolder segment to an IK folder path.
   * The second path segment (between "uploads/" and the filename) becomes
   * a subfolder inside the project root.
   * Examples:
   *   key = "uploads/media/abc.webp"    → folder = "/my-blog/media"
   *   key = "uploads/files/doc.pdf"     → folder = "/my-blog/files"
   *   key = "uploads/avatars/xyz.webp"  → folder = "/my-blog/avatars"
   *   key = "uploads/abc.webp"          → folder = "/my-blog"   (fallback)
   */
  private folderForKey(key: string): string {
    // key format:  "uploads/<subfolder>/<filename>"
    // Extract the subfolder segment (index 1 when split by '/')
    const parts = key.replace(/^\//, '').split('/');
    // parts[0] = 'uploads', parts[1] = subfolder, parts[2] = filename
    const subfolder = parts.length >= 3 ? parts[1] : null;
    return subfolder
      ? `/${this.rootFolder}/${subfolder}`
      : `/${this.rootFolder}`;
  }

  // ─── interface ──────────────────────────────────────────────────────────────

  async upload(buffer: Buffer, key: string, mimeType: string): Promise<UploadResult> {
    const fileName = path.basename(key);
    const folder = this.folderForKey(key);

    const formData = new FormData();
    formData.append('file', new Blob([buffer], { type: mimeType }), fileName);
    formData.append('fileName', fileName);
    formData.append('folder', folder);
    // Overwrite if same name exists in that folder (mirrors local behaviour)
    formData.append('useUniqueFileName', 'false');

    const res = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
      method: 'POST',
      headers: { Authorization: `Basic ${this.credentials}` },
      body: formData,
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`ImageKit upload failed (${res.status}): ${body}`);
    }

    const data = await res.json() as {
      fileId: string;
      name: string;
      url: string;
      size: number;
      filePath: string;  // e.g. "/my-blog/media/abc.webp"
      mimeType: string;
    };

    // Strip the leading slash so the stored key is always relative
    // e.g. "my-blog/media/abc.webp"
    const storedKey = data.filePath.replace(/^\/+/, '');

    return {
      file_url: storedKey,
      public_url: data.url,
      file_name: data.name,
      file_type: data.mimeType || mimeType,
      file_size: data.size ?? buffer.byteLength,
    };
  }

  async delete(key: string): Promise<DeleteResult> {
    try {
      // ImageKit delete requires the fileId. Search by filePath to retrieve it.
      const filePath = key.startsWith('/') ? key : `/${key}`;

      const searchRes = await fetch(
        `https://api.imagekit.io/v1/files?path=${encodeURIComponent(filePath)}`,
        { headers: { Authorization: `Basic ${this.credentials}` } },
      );

      if (!searchRes.ok) return { success: false };

      const files = await searchRes.json() as Array<{ fileId: string }>;
      if (!files.length) return { success: true }; // already gone

      const delRes = await fetch(
        `https://api.imagekit.io/v1/files/${files[0].fileId}`,
        { method: 'DELETE', headers: { Authorization: `Basic ${this.credentials}` } },
      );

      return { success: delRes.ok };
    } catch {
      return { success: false };
    }
  }

  getPublicUrl(key: string): string {
    // key is stored without a leading slash, e.g. "my-blog/media/abc.webp"
    const clean = key.replace(/^\/+/, '');
    return `${this.urlEndpoint}/${clean}`;
  }
}

