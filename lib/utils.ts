import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Resolve any stored image value into a fully-qualified URL safe to put in <img src>.
 *
 * Handles:
 *   - Already-absolute URLs (http/https)  → returned as-is
 *   - blob: / data: object URLs           → returned as-is (local preview)
 *   - Relative keys ("uploads/…")         → resolved against the correct provider endpoint
 *   - null / undefined                    → returns fallback
 */
export function resolveImageUrl(
  value: string | null | undefined,
  fallback = '/static/images/profile-holder.webp',
): string {
  if (!value) return fallback;

  // Already a usable URL
  if (/^(https?|blob|data):/.test(value)) return value;

  // Relative path — resolve against provider
  const provider = (process.env.NEXT_PUBLIC_STORAGE_PROVIDER || 'local').toLowerCase();

  if (provider === 'imagekit') {
    const endpoint = (process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || '').replace(/\/$/, '');
    const clean = value.replace(/^\/+/, '');
    return endpoint ? `${endpoint}/${clean}` : fallback;
  }

  // local / s3 with public base
  const base = (
    process.env.NEXT_PUBLIC_REMOTE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    ''
  ).replace(/\/$/, '');
  const clean = value.replace(/^\/+/, '');
  return base ? `${base}/${clean}` : `/${clean}`;
}
