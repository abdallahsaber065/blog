"use client"
import React from 'react'
import { MDXProvider } from '@mdx-js/react'
import Image from 'next/image'
import { PrismaClient, Post } from '@prisma/client'

const prisma = new PrismaClient();

const mdxComponents = {
    Image
}

const RenderMdx = ({ post }: { post: Post }) => {
    console.log('Post content:', post.content)
    const MDXContent = useMDXComponent(post.content)

    try {
        return (
            <div className='col-span-12  lg:col-span-8 font-in prose sm:prose-base md:prose-lg max-w-max
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
                <MDXContent components={mdxComponents} />
            </div>
        )
    } catch (error) {
        console.error('Error rendering MDX content:', error)
        return <div>Error rendering content</div>
    }
}

export default RenderMdx