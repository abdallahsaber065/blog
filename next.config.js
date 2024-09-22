const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.alias['public'] = path.join(__dirname, 'public');
    return config;
  },
};

const withMDX = require('@next/mdx')({
  extension: /\.mdx?$/,
  options: {
  remarkPlugins: [require('remark-gfm')],
  rehypePlugins: [
    require('rehype-slug'),
    require('rehype-autolink-headings'),
    require('rehype-pretty-code'),
  ],
  // MDX-specific options can go here
  },
});

module.exports = withMDX({
  ...nextConfig, // Merge nextConfig into withMDX options
  // Next.js config options here
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'], // Add MD and MDX as page extensions
});
