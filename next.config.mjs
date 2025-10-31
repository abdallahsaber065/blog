import createMDX from '@next/mdx';
import dotenv from 'dotenv';
import path from 'path';
import remarkGfm from 'remark-gfm';
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
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/uploads/**',
      }, {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/blogs/**',
      },
      {
        protocol: 'https',
        hostname: 'devtrend.tech',
        pathname: '/uploads/**',
      }
    ]
  },

  distDir: process.env.BUILD_DIR || '.next',
  transpilePackages: ['@mdxeditor/editor'],
  reactStrictMode: false,

  // Turbopack configuration (used in development by default in Next.js 16)
  turbopack: {
    // Turbopack handles most configurations automatically
    // No custom aliases needed - use /path for public assets
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
  // Configure `pageExtensions` to include MDX files
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
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

const withMDX = createMDX({
  // Add markdown plugins here, as desired
  options: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [],
  },
});

// Wrap MDX and Next.js config with each other
export default withMDX(nextConfig);