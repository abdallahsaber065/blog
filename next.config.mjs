import dotenv from 'dotenv';
import path from 'path';
import TerserPlugin from 'terser-webpack-plugin';
import { fileURLToPath } from 'url';


dotenv.config();

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


/** @type {import('next').NextConfig} */
const nextConfig = {
  // Turbopack is now the default bundler in Next.js 16
  // Enable component caching for better performance
  cacheComponents: true,
  images: {
    minimumCacheTTL: 600,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'devtrend.tech',
        pathname: '/**',
      },
      {
        // AWS S3 buckets - covers *.s3.amazonaws.com and *.s3.<region>.amazonaws.com
        protocol: 'https',
        hostname: '**.amazonaws.com',
        pathname: '/**',
      },
      {
        // MinIO / R2 / any custom S3-compatible endpoint (adjust hostname as needed)
        protocol: 'https',
        hostname: '**.r2.dev',
        pathname: '/**',
      },
      {
        // ImageKit CDN
        protocol: 'https',
        hostname: 'ik.imagekit.io',
        pathname: '/**',
      },
    ]
  },

  distDir: process.env.BUILD_DIR || '.next',
  transpilePackages: ['@mdxeditor/editor'],
  reactStrictMode: false,

  // Turbopack configuration (used in development by default in Next.js 16)
  turbopack: {
    // Turbopack handles most configurations automatically
    // No custom aliases needed - use /path for public assets
    root: __dirname,
  },

  // Webpack customizations (used for production builds)
  webpack: (config) => {
    config.experiments = { ...config.experiments, topLevelAwait: true };
    config.optimization.minimizer = [
      new TerserPlugin({
        terserOptions: {
          output: {
            ascii_only: true,
          },
        },
      }),
    ];
    return config;
  },
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  // Optionally, add any other Next.js config below

  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    CONTENT_GENERATOR_API_LINK: process.env.CONTENT_GENERATOR_API_LINK,
    DATABASE_URL: process.env.DATABASE_URL,
    SECRET_KEY: process.env.SECRET_KEY,
    MAILGUN_USER: process.env.MAILGUN_USER,
    MAILGUN_PASS: process.env.MAILGUN_PASS,
    NEXT_PUBLIC_CSRF_TOKEN: process.env.CSRF_SECRET,
    WEBSITE_TYPE: process.env.WEBSITE_TYPE,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    // Storage
    STORAGE_PROVIDER: process.env.STORAGE_PROVIDER,
    NEXT_PUBLIC_STORAGE_PROVIDER: process.env.STORAGE_PROVIDER,
    STORAGE_S3_BUCKET: process.env.STORAGE_S3_BUCKET,
    STORAGE_S3_REGION: process.env.STORAGE_S3_REGION,
    STORAGE_S3_PUBLIC_URL: process.env.STORAGE_S3_PUBLIC_URL,
    // ImageKit (public key & endpoint are safe to expose; private key stays server-only)
    IMAGEKIT_PUBLIC_KEY: process.env.IMAGEKIT_PUBLIC_KEY,
    NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT: process.env.IMAGEKIT_URL_ENDPOINT,
    IMAGEKIT_FOLDER: process.env.IMAGEKIT_FOLDER,
  },

  async redirects() {
    return [
      {
        source: '/tags',
        destination: '/explore',
        permanent: true,
      },
      {
        source: '/tags/:slug',
        destination: '/explore?tag=:slug',
        permanent: true,
      },
      {
        source: '/categories',
        destination: '/explore',
        permanent: true,
      },
      {
        source: '/categories/:slug',
        destination: '/explore?category=:slug',
        permanent: true,
      },
      {
        source: '/discover',
        destination: '/explore',
        permanent: true,
      }
    ];
  },

};

export default nextConfig;