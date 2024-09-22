const path = require('path');
const nextMdx = require('@next/mdx');

const withMdx = nextMdx({
  // By default only the `.mdx` extension is supported.
  extension: /\.mdx?$/,
  options: {
    // Add any other MDX options here
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = withMdx({
  // Support MDX files as pages:
  pageExtensions: ['md', 'mdx', 'tsx', 'ts', 'jsx', 'js'],
  webpack: (config) => {
    config.resolve.alias['public'] = path.join(__dirname, 'public');
    return config;
  },
});

module.exports = nextConfig;