// components/RenderMdx.tsx
'use client';

import { MDXRemote } from 'next-mdx-remote';
import { MDXRemoteSerializeResult } from 'next-mdx-remote/dist/types';

interface RenderMdxProps {
  mdxSource: MDXRemoteSerializeResult;
}

const TestComponent = () => {
    return <div>Test Component</div>;
    }

const RenderMdx: React.FC<RenderMdxProps> = ({ mdxSource }) => {
  return <MDXRemote {...mdxSource} components={{ TestComponent }} />;
};

export default RenderMdx;