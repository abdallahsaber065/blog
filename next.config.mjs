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

  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,

  // Enable advanced logging for debugging Serverless/Edge functions
  logging: {
    fetches: {
      fullUrl: true,
    },
  },

  // Optimized for Serverless Environments (Vercel, Netlify, Docker)
  output: "standalone",
  compiler: {
    // Remove console logs in production to optimize Edge/Serverless function execution
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },
  experimental: {
    // Optimizes package imports, reducing function size when deployed as Serverless/Edge
    optimizePackageImports: [
      'lucide-react',
      'react-icons',
      'date-fns',
      'framer-motion',
      'lodash',
      'clsx',
      'tailwind-merge'
    ],
  },

  images: {
    minimumCacheTTL: 600,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    formats: ['image/avif', 'image/webp'],
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
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      }
    ]
  },

  distDir: process.env.BUILD_DIR || '.next',
  transpilePackages: ['@mdxeditor/editor'],

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

  // The 'env' block is removed to prevent inlining sensitive server-side variables into the client bundle.
  // Next.js automatically handles variables prefixed with NEXT_PUBLIC_ for the client,
  // and all other variables are available server-side by default.


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