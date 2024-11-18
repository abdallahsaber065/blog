import remarkGfm from 'remark-gfm';
import createMDX from '@next/mdx';
import path from 'path';
import { fileURLToPath } from 'url';
import TerserPlugin from 'terser-webpack-plugin';
import dotenv from 'dotenv';

// Load the appropriate env file based on NEXT_PUBLIC_SITE_TYPE
const envFile = process.env.NEXT_PUBLIC_SITE_TYPE === 'college' ? '.env.college' : '.env';
dotenv.config({ path: envFile });

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: true,
  images: {
    minimumCacheTTL: 600,
    domains: ['localhost', 'devtrend.tech', 'college.devtrend.tech'], // Add college domain

  },

  distDir: process.env.BUILD_DIR || '.next',
  transpilePackages: ['@mdxeditor/editor'],
  reactStrictMode: false,
  webpack: (config) => {
    config.experiments = { ...config.experiments, topLevelAwait: true };
    config.resolve.alias['public'] = path.join(__dirname, 'public');
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

  compiler: {
    // Remove console logs only in production
    removeConsole: process.env.NODE_ENV === "production"
  },

  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    CONTENT_GENERATOR_API_LINK: process.env.CONTENT_GENERATOR_API_LINK,
    DATABASE_URL: process.env.DATABASE_URL,
    SECRET_KEY: process.env.SECRET_KEY,
    MAILGUN_USER: process.env.MAILGUN_USER,
    MAILGUN_PASS: process.env.MAILGUN_PASS,
    NEXT_PUBLIC_CSRF_TOKEN: process.env.CSRF_SECRET,
  },

  async redirects() {
    return [
      {
        source: '/categories',
        destination: '/categories/all',
        permanent: true,
      },
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