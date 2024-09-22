"use client"
import React from 'react';
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote';
import { serialize } from 'next-mdx-remote/serialize';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypePrettyCode from 'rehype-pretty-code';
import Image from 'next/image';
import { PrismaClient, Post } from '@prisma/client';

const prisma = new PrismaClient();

const mdxComponents = {
  Image,
  h1: ({ children }: { children: React.ReactNode }) => <h1 style={{ color: 'red', fontSize: '48px' }}>{children}</h1>,
  // Add other custom components here
};

const RenderMdx = ({ source }: { source: MDXRemoteSerializeResult }) => {
  return (
    <div className='col-span-12 lg:col-span-8 font-in prose sm:prose-base md:prose-lg max-w-max
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
    '>
      <MDXRemote {...source} components={mdxComponents} />
    </div>
  );
};

export async function getServerSideProps(context: any) {
  const { slug }: { slug: string } = context.params;
  const post: Post | null = await prisma.post.findUnique({
    where: { slug },
    include: {
      author: true,
      tags: true,
      category: true,
    },
  });

  if (!post) {
    return {
      notFound: true,
    };
  }

  const mdxSource = await serialize(post.content, {
    mdxOptions: {
      remarkPlugins: [remarkGfm],
      rehypePlugins: [
        rehypeSlug,
        [rehypeAutolinkHeadings, { behavior: 'append' }],
        [rehypePrettyCode, { theme: 'github-dark' }],
      ],
    },
  });

  return {
    props: {
      source: mdxSource,
    },
  };
}

export default RenderMdx;