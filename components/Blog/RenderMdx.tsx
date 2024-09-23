import React, { Suspense } from 'react';
import { MDXRemote } from 'next-mdx-remote/rsc';
import Image from 'next/image';
import { Post as PrismaPost, Tag, User } from '@prisma/client';
import { SerializeOptions } from 'next-mdx-remote/dist/types';
// mdxOptions.js
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

type PostWithAuthorAndTags = PrismaPost & {
  author: User | null;
  tags: Tag[];
};

const mdxComponents = (featuredImageUrl: string) => ({
  Image: (props: any) => (
    <Image
      {...props}
      src={featuredImageUrl}
      alt={props.alt || 'Featured Image'}
      width={800}
      height={600}
      style={{ width: '100%', height: 'auto' }}
    />
  ),
});

const RenderMdx = ({ post }: { post: PostWithAuthorAndTags }) => {

  const mdxOptions = {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeSlug,
      [rehypeAutolinkHeadings, { behavior: "wrap" }],
      rehypePrettyCode,
    ],
  };

  console.log('MDX Options:', mdxOptions);

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
      <Suspense fallback={<>Loading...</>}>
        <MDXRemote
          source={post.content}
          components={mdxComponents(post.featured_image_url || '')}
          options={mdxOptions as SerializeOptions}
        />
      </Suspense>
    </div>
  );
};

export default RenderMdx;