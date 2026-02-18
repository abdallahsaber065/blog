import type { StorageProvider } from './types';
import { LocalStorageProvider } from './localProvider';
import { S3StorageProvider } from './s3Provider';
import { ImageKitStorageProvider } from './imagekitProvider';

export type { StorageProvider, UploadResult, DeleteResult } from './types';

/**
 * Returns the configured storage provider.
 * Controlled by  STORAGE_PROVIDER=local|s3|imagekit  in .env  (default: local)
 */
export function getStorageProvider(): StorageProvider {
  const provider = (process.env.STORAGE_PROVIDER || 'local').toLowerCase().trim();

  switch (provider) {
    case 's3':
      return new S3StorageProvider();
    case 'imagekit':
      return new ImageKitStorageProvider();
    case 'local':
    default:
      return new LocalStorageProvider();
  }
}

/**
 * Convenience: convert a stored DB key into a publicly accessible URL
 * using whichever provider is currently configured.
 * Safe to call from both API routes and React components (via NEXT_PUBLIC_* vars).
 */
export function resolvePublicUrl(fileUrl: string): string {
  // Already an absolute URL (http/https) — return as-is
  if (/^https?:\/\//i.test(fileUrl)) return fileUrl;

  // Client-side: we cannot instantiate the full provider, so we build the URL
  // directly from env vars exposed to the browser.
  if (typeof window !== 'undefined') {
    const provider = (process.env.STORAGE_PROVIDER || 'local').toLowerCase();

    if (provider === 'imagekit') {
      const endpoint = (process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || '').replace(/\/$/, '');
      const clean = fileUrl.replace(/^\/+/, '');
      return `${endpoint}/${clean}`;
    }

    const base = (
      process.env.NEXT_PUBLIC_REMOTE_URL ||
      process.env.NEXT_PUBLIC_BASE_URL ||
      ''
    ).replace(/\/$/, '');
    const clean = fileUrl.replace(/^\/+/, '');
    return `${base}/${clean}`;
  }

  // Server-side: delegate to the real provider
  return getStorageProvider().getPublicUrl(fileUrl);
}
