
export type { StorageProvider, UploadResult, DeleteResult } from './types';

/**
 * Convenience: convert a stored DB key into a publicly accessible URL
 * using whichever provider is currently configured.
 * Safe to call from both API routes and React components (via NEXT_PUBLIC_* vars).
 */
export function resolvePublicUrl(fileUrl: string | null | undefined): string {
  if (!fileUrl) return '/static/images/default-image.webp';

  // Already an absolute URL (http/https) - return as-is
  if (/^https?:\/\//i.test(fileUrl)) return fileUrl;

  // Use NEXT_PUBLIC_ if available (client side), otherwise fallback to server-side env
  const provider = (
    process.env.NEXT_PUBLIC_STORAGE_PROVIDER ||
    process.env.STORAGE_PROVIDER ||
    'local'
  ).toLowerCase().trim();

  const clean = fileUrl.replace(/^\/+/, '');

  if (provider === 'imagekit') {
    const endpoint = (
      process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT ||
      process.env.IMAGEKIT_URL_ENDPOINT ||
      ''
    ).replace(/\/$/, '');
    return `${endpoint}/${clean}`;
  }

  if (provider === 's3') {
    const customBase = (
      process.env.STORAGE_S3_PUBLIC_URL ||
      process.env.NEXT_PUBLIC_STORAGE_S3_PUBLIC_URL ||
      ''
    ).replace(/\/$/, '');

    const bucket = process.env.NEXT_PUBLIC_STORAGE_S3_BUCKET || process.env.STORAGE_S3_BUCKET || '';
    const region = process.env.NEXT_PUBLIC_STORAGE_S3_REGION || process.env.STORAGE_S3_REGION || 'us-east-1';

    const endpoint = customBase || `https://${bucket}.s3.${region}.amazonaws.com`;
    return `${endpoint}/${clean}`;
  }

  // Default: Local
  const base = (
    process.env.NEXT_PUBLIC_REMOTE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.REMOTE_URL ||
    process.env.BASE_URL ||
    ''
  ).replace(/\/$/, '');

  return `${base}/${clean}`;
}
