/**
 * SmartImage — renders external / blob / data URLs with a plain <img> tag
 * (no Next.js image proxy overhead, no cold-start cost on serverless).
 * For local static assets (paths starting with "/", no host) it falls back
 * to next/image so you still get optimisation for your own bundled assets.
 */
import NextImage, { ImageProps as NextImageProps } from 'next/image';

type SmartImageProps = Omit<NextImageProps, 'src'> & {
  src: string | null | undefined;
  fallback?: string;
  imgClassName?: string;
};

function isExternal(src: string): boolean {
  // blob:, data:, or any http(s) URL
  return /^(https?|blob|data):/.test(src);
}

export default function SmartImage({
  src,
  fallback = '/static/images/profile-holder.webp',
  alt = '',
  width,
  height,
  className,
  imgClassName,
  onError,
  ...rest
}: SmartImageProps) {
  const resolved = src || fallback;

  if (isExternal(resolved)) {
    // Plain <img> — zero proxy, zero cold-start, works on any host
    return (
      <img
        src={resolved}
        alt={alt as string}
        width={width as number | undefined}
        height={height as number | undefined}
        className={imgClassName ?? (className as string | undefined)}
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = fallback;
          if (typeof onError === 'function') (onError as React.ReactEventHandler<HTMLImageElement>)(e as any);
        }}
      />
    );
  }

  // Local static asset — use next/image for optimisation
  return (
    <NextImage
      src={resolved}
      alt={alt as string}
      width={width}
      height={height}
      className={className}
      onError={onError}
      {...rest}
    />
  );
}
