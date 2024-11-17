import BlogDetails from "@/components/Blog/BlogDetails";
import RenderMdx from "@/components/Blog/RenderMdx";
import Image from "next/image";
import Tag from "@/components/Elements/Tag";
import siteMetadata from "@/lib/siteMetaData";
import { serialize } from 'next-mdx-remote/serialize';
import { Options } from "@/lib/articles/mdxconfig";
import { GetStaticPaths, GetStaticProps } from 'next';
import { prisma } from '@/lib/prisma';
import React, { useEffect, useState } from "react";
import CustomImage from '@/components/MdxComponents/Image/CustomImageView';
import { SerializeOptions } from "next-mdx-remote/dist/types";
import TableOfContent from "@/components/Blog/TableOfContenet";
import CustomFileView from "@/components/MdxComponents/File/CustomFileView";
import ResourcesSection from "@/components/MdxComponents/File/ResourcesSection";
import InlineFileView from '@/components/MdxComponents/File/InlineFileView';
import Embed from "@/components/MdxComponents/Embed/Embed";
import { getSession } from 'next-auth/react';
import FileResource from "@/components/MdxComponents/File/FileResource";

export const getStaticPaths: GetStaticPaths = async () => {
    const posts = await prisma.post.findMany({
        where: {
            status: 'published',
        },
        select: {
            slug: true,
        },
    });

    const paths = posts.map((post) => ({
        params: { slug: post.slug },
    }));

    return {
        paths,
        fallback: 'blocking'
    };
};

export const getStaticProps: GetStaticProps = async ({ params, preview = false }) => {
    const { slug } = params as { slug: string };

    const post = await prisma.post.findUnique({
        where: { slug },
        select: {
            id: true,
            slug: true,
            title: true,
            content: true,
            excerpt: true,
            featured_image_url: true,
            created_at: true,
            updated_at: true,
            published_at: true,
            reading_time: true,
            status: true,
            author: {
                select: {
                    username: true,
                    created_at: true,
                    updated_at: true,
                },
            },
            tags: {
                select: {
                    name: true,
                    slug: true,
                },
            },
        },
    });

    if (!post) {
        return { notFound: true };
    }

    let imageList = [siteMetadata.socialBanner];
    if (post.featured_image_url) {
        imageList = [post.featured_image_url];
    }

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        "headline": post.title,
        "description": post.excerpt,
        "image": imageList,
        "datePublished": post.published_at ? new Date(post.published_at).toISOString() : null,
        "dateModified": new Date(post.updated_at || post.published_at).toISOString(),
        "author": [{
            "@type": "Person",
            "name": post?.author ? [post.author.username] : siteMetadata.author,
            "url": siteMetadata.twitter,
        }]
    };

    // Find all <File .../> and <InlineFile .../> tags in the post content
    const fileTagRegex = /<(File|InlineFile)\s+([^>]+)\s*\/>/g;
    const attributeRegex = /(\w+)="([^"]*)"/g;
    const files = [];
    let match;

    while ((match = fileTagRegex.exec(post.content)) !== null) {
        const attributes = match[2];
        const file = { src: '', filename: '' };
        let attrMatch;

        while ((attrMatch = attributeRegex.exec(attributes)) !== null) {
            const [_, attrName, attrValue] = attrMatch;
            if (attrName === 'src') {
                file.src = attrValue;
            } else if (attrName === 'filename') {
                file.filename = attrValue;
            }
        }

        files.push(file);
    }

    console.log("files:", files);

    // Add the "Resources" section to the post content
    const resourcesSectionHtml = `<ResourcesSection files={${JSON.stringify(files)}} />`;

    const finalContent = `${post.content}\n\n${resourcesSectionHtml}`;

    // Serialize the modified content
    const mdxSource = await serialize(
        finalContent,
        Options as SerializeOptions
    );

    // Convert Date objects to strings
    const serializedPost = {
        ...post,
        created_at: post.created_at.toISOString(),
        updated_at: post.updated_at.toISOString(),
        published_at: post.published_at ? post.published_at.toISOString() : null,

        // Convert author Date objects to strings
        author: {
            ...post.author,
            created_at: post?.author?.created_at.toISOString(),
            updated_at: post?.author?.updated_at.toISOString(),
        },
    };

    return {
        props: {
            post: serializedPost,
            mdxSource,
            jsonLd,
        },
        revalidate: false, // Revalidate on demand
    };
};

const BlogPage = ({ post, mdxSource, jsonLd }: any) => {
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const session = await getSession();
            const hasAccess = session?.user?.role && ['admin', 'editor', 'moderator'].includes(session.user.role);
            setIsAuthorized(hasAccess || false);
            setLoading(false);
        };
        
        checkAuth();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    // Show unauthorized message if not published and user is not authorized
    if (post.status !== 'published' && !isAuthorized) {
        return (
            <main className="container mx-auto pb-16 px-4 flex-1">
                <div className="max-w-2xl mx-auto bg-white dark:bg-slate-800 p-8 rounded-lg shadow-lg mt-8">
                    <h1 className="text-3xl font-bold text-red-600 mb-4">Access Denied</h1>
                    <p className="text-slate-700 dark:text-slate-300 mb-4">
                        This post is currently not published and requires special permissions to view.
                    </p>
                    <p className="text-slate-600 dark:text-slate-400">
                        Please contact an administrator if you believe you should have access to this content.
                    </p>
                </div>
            </main>
        );
    }

    // Convert strings back to Date objects
    const deserializedPost = {
        ...post,
        created_at: new Date(post.created_at),
        updated_at: new Date(post.updated_at),
        published_at: post.published_at ? new Date(post.published_at) : null,
    };

    const mdxComponents = () => ({
        Image: (props: any) => <CustomImage {...props} />,
        img: (props: any) => <CustomImage {...props} />,
        File: (props: any) => <CustomFileView {...props} />,
        file: (props: any) => <CustomFileView {...props} />,
        ResourcesSection: (props: any) => <ResourcesSection {...props} />,
        InlineFile: (props: any) => <InlineFileView {...props} />,
        Embed: (props: any) => <Embed {...props} />,
        FileResource: (props: any) => <FileResource {...props} />,
    });

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <article>
                {post.status !== 'published' && (
                    <div className="w-full bg-amber-50 dark:bg-amber-900/30 border-y border-amber-200 dark:border-amber-700/50 py-3 text-center">
                        <span className="text-amber-800 dark:text-amber-200 text-sm md:text-base font-medium px-4 flex items-center justify-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                            </svg>
                            {post.status.charAt(0).toUpperCase() + post.status.slice(1)} Preview Mode
                        </span>
                    </div>
                )}
                <div className="mb-8 text-center relative w-full h-[70vh] bg-dark">
                    <div className="w-full z-10 flex flex-col items-center justify-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        {deserializedPost.tags?.[0] && (
                            <Tag
                                name={deserializedPost.tags[0].name}
                                link={`/categories/${deserializedPost.tags[0].slug}`}
                                className="px-6 text-sm py-2"
                            />
                        )}
                        <h1
                            className="inline-block mt-6 font-semibold capitalize text-light text-2xl md:text-3xl lg:text-5xl !leading-normal relative w-5/6"
                        >
                            {deserializedPost.title}
                        </h1>
                    </div>
                    <div className="absolute top-0 left-0 right-0 bottom-0 h-full bg-dark/60 dark:bg-dark/40" />
                    <Image
                        src={deserializedPost.featured_image_url || '/default-image.jpg'}
                        placeholder="blur"
                        blurDataURL={deserializedPost.featured_image_url || '/default-image.jpg'}
                        alt={deserializedPost.title}
                        width={800}
                        height={600}
                        className="aspect-square w-full h-full object-cover object-center"
                        priority
                        sizes="100vw"
                    />
                </div>

                <BlogDetails post={deserializedPost} postSlug={deserializedPost.slug} tags={deserializedPost.tags} />
                <div className="grid grid-cols-12 gap-y-8 lg:gap-8 sxl:gap-16 mt-8 px-5 md:px-10">
                    <TableOfContent mdxContent={post.content} />
                    <RenderMdx mdxSource={mdxSource} additionalComponents={mdxComponents()} />
                </div>
            </article>
        </>
    );
};

export default BlogPage;