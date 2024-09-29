// components/RenderMdx.tsx
'use client';

import { MDXRemote } from 'next-mdx-remote';
import { MDXRemoteSerializeResult } from 'next-mdx-remote/dist/types';
import Image from 'next/image';
import { Post as PrismaPost, Tag, User } from '@prisma/client';



interface RenderMdxProps {
  mdxSource: MDXRemoteSerializeResult;
  additionalComponents?: Record<string, React.FC>;
}

const RenderMdx: React.FC<RenderMdxProps> = ({ mdxSource , additionalComponents }) => {
  return (
    <div className='
    col-span-12 lg:col-span-8 font-in prose sm:prose-base md:prose-lg max-w-max
    prose-blockquote:bg-accent/20 
    prose-blockquote:p-2
    prose-blockquote:px-6
    prose-blockquote:border-accent
    prose-blockquote:not-italic
    prose-blockquote:rounded-r-lg

    prose-li:marker:text-accent

    dark:prose-invert
    dark:prose-blockquote:border-accentDark
    dark:prose-blockquote:bg-accentDark/20
    dark:prose-li:marker:text-accentDark

    first-letter:text-3xl
    sm:first-letter:text-5xl
    text-gray 
    dark:text-lightgray

    // Custom styles for light theme
    prose-h1:text-dark
    prose-h2:text-dark
    prose-h3:text-dark
    prose-h4:text-dark
    prose-h5:text-dark
    prose-h6:text-dark
    dark:prose-h1:text-light
    dark:prose-h2:text-light
    dark:prose-h3:text-light
    dark:prose-h4:text-light
    dark:prose-h5:text-light
    dark:prose-h6:text-light
    prose-blockquote:text-dark
    dark:prose-blockquote:text-light

    prose-strong:text-dark
    dark:prose-strong:text-light

    // Custom styles for inline code
    prose-code:bg-gray-200
    prose-code:text-dark
    dark:prose-code:bg-gray-800
    dark:prose-code:text-light

    // Custom styles for links
    prose-a:text-accent
    dark:prose-a:text-accentDark

    
    '>
      <MDXRemote
      {...mdxSource}
      components={{
        ...additionalComponents,
      }}
      />
    </div>
  );
};

export default RenderMdx;