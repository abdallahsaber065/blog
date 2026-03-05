
export type { StorageProvider, UploadResult, DeleteResult } from './types';

/**
 * Convenience: convert a stored DB key into a publicly accessible URL
 * using whichever provider is currently configured.
 * Safe to call from both API routes and React components (via NEXT_PUBLIC_* vars).
 */
export function resolvePublicUrl(fileUrl: string | null | undefined): string {
  if (!fileUrl) return '/static/images/default-image.webp';

  // If it's already a full URL that's NOT a relative-looking path accidentally matched
  if (/^https?:\/\//i.test(fileUrl)) return fileUrl;

  // Handle absolute paths by making them relative to the root if they aren't already
  // This ensures they are prefixed with the BASE_URL correctly
  const path = fileUrl.startsWith('/') ? fileUrl : `/${fileUrl}`;

  // Use NEXT_PUBLIC_ if available (client side), otherwise fallback to server-side env
  const provider = (
    process.env.NEXT_PUBLIC_STORAGE_PROVIDER ||
    process.env.STORAGE_PROVIDER ||
    'local'
  ).toLowerCase().trim();

  // Check if it's a known local static folder (e.g. from the seed or project assets)
  // We check the path (which now definitely starts with /)
  const isLocalStatic = /^\/(blogs|static|svgs|fonts|templates|images|favicon|robots|sitemap|manifest)/i.test(path);

  if (isLocalStatic || provider === 'local') {
    const base = (
      process.env.NEXT_PUBLIC_REMOTE_URL ||
      process.env.NEXT_PUBLIC_BASE_URL ||
      process.env.REMOTE_URL ||
      process.env.BASE_URL ||
      ''
    ).replace(/\/$/, '');

    return `${base}${path}`;
  }

  const clean = path.replace(/^\/+/, '');

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

export function isCloudProvider(): boolean {
  const provider = (
    process.env.NEXT_PUBLIC_STORAGE_PROVIDER ||
    process.env.STORAGE_PROVIDER ||
    'local'
  ).toLowerCase().trim();
  return provider === 'imagekit' || provider === 's3';
}

export function isExternalUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return /^https?:\/\//i.test(url) && !url.includes('localhost') && !url.includes('127.0.0.1');
}

export function isBlobUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return url.startsWith('blob:');
}
