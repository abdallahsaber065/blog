import BlogDetails from "@/components/Blog/BlogDetails";
import BlogTemplate from "@/components/Blog/BlogTemplate";
import RenderMdx from "@/components/Blog/RenderMdx";
import TableOfContent from "@/components/Blog/TableOfContent";
import Tag from "@/components/Elements/Tag";
import Embed from "@/components/MdxComponents/Embed/Embed";
import CustomFileView from "@/components/MdxComponents/File/CustomFileView";
import FileResource from "@/components/MdxComponents/File/FileResource";
import InlineFileView from '@/components/MdxComponents/File/InlineFileView';
import ResourcesSection from "@/components/MdxComponents/File/ResourcesSection";
import CustomImage from '@/components/MdxComponents/Image/CustomImageView';
import { Options } from "@/lib/articles/mdxconfig";
import { prisma } from '@/lib/prisma';
import siteMetadata from "@/lib/siteMetaData";
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import { serialize } from 'next-mdx-remote/serialize';
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export const getServerSideProps: GetServerSideProps = async ({ params, req }) => {
    const { slug } = params as { slug: string };
    const session = await getSession({ req });

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
            category: {
                select: {
                    name: true,
                    slug: true,
                },
            },
        },
    });

    if (!post || !session) {
        return { notFound: true };
    }

    const hasAccess = session?.user?.role && ['admin', 'editor', 'moderator'].includes(session.user.role);

    if (post.status !== 'published' && !hasAccess) {
        return {
            props: {
                post: null,
                mdxSource: null,
                jsonLd: null,
                isAuthorized: false,
            },
        };
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

    const resourcesSectionHtml = `<ResourcesSection files={${JSON.stringify(files)}} />`;

    const finalContent = `${post.content}\n\n${resourcesSectionHtml}`;

    const mdxSource = await serialize(
        finalContent,
        Options
    );

    const serializedPost = {
        ...post,
        created_at: post.created_at.toISOString(),
        updated_at: post.updated_at.toISOString(),
        published_at: post.published_at ? post.published_at.toISOString() : null,

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
            isAuthorized: true,
        },
    };
};

const BlogPreviewPage = ({ post, mdxSource, jsonLd, isAuthorized }: any) => {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(false);
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!isAuthorized) {
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

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <BlogTemplate post={post} mdxSource={mdxSource} isPreview={true} />
        </>
    );
};

export default BlogPreviewPage;