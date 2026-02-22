import React from 'react';
import Image from "next/image";
import Link from "next/link";
import BlogDetails from "@/components/Blog/BlogDetails";
import RenderMdx from "@/components/Blog/RenderMdx";
import TableOfContent from "@/components/Blog/TableOfContent";
import Tag from "@/components/Elements/Tag";
import CustomImage from '@/components/MdxComponents/Image/CustomImageView';
import CustomFileView from '@/components/MdxComponents/File/CustomFileView';
import InlineFileView from '@/components/MdxComponents/File/InlineFileView';
import ResourcesSection from "@/components/MdxComponents/File/ResourcesSection";
import Embed from "@/components/MdxComponents/Embed/Embed";
import FileResource from "@/components/MdxComponents/File/FileResource";
import siteMetadata from "@/lib/siteMetaData";
import { resolvePublicUrl, isCloudProvider, isExternalUrl } from '@/lib/storage';

interface BlogTemplateProps {
    post: any;
    mdxSource: any;
    isPreview?: boolean;
    scrollContainerId?: string;
}

const BlogTemplate: React.FC<BlogTemplateProps> = ({ post, mdxSource, isPreview = false, scrollContainerId }) => {

    // Fallback for when post data might differ in structure (editor vs db)
    const normalizedPost = {
        ...post,
        created_at: post.created_at ? new Date(post.created_at) : new Date(),
        updated_at: post.updated_at ? new Date(post.updated_at) : new Date(),
        published_at: post.published_at ? new Date(post.published_at) : (isPreview ? new Date() : null),
        author: post.author || { username: siteMetadata.author },
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

    // Handle image URLs (handle blobs from preview)
    const displayImage = normalizedPost.featured_image_url ? resolvePublicUrl(normalizedPost.featured_image_url) : '/static/images/default-image.webp';
    const blurImage = normalizedPost.featured_image_url ? resolvePublicUrl(normalizedPost.featured_image_url) : '/static/images/default-image.webp';

    return (
        <article className="bg-light dark:bg-dark">
            {normalizedPost.status !== 'published' && !isPreview && (
                <div className="w-full bg-amber-50 dark:bg-amber-900/30 border-y border-amber-200 dark:border-amber-700/50 py-3 text-center">
                    <span className="text-amber-800 dark:text-amber-200 text-sm md:text-base font-medium px-4 flex items-center justify-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                        </svg>
                        {normalizedPost?.status ? normalizedPost.status.charAt(0).toUpperCase() + normalizedPost.status.slice(1) : 'Draft'} Preview Mode
                    </span>
                </div>
            )}
            <div className="mb-8 text-center relative w-full h-[70vh] bg-dark">
                <div className="w-full z-10 flex flex-col items-center justify-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    {normalizedPost.category && (
                        <Tag
                            name={normalizedPost.category.name}
                            link={`/explore?category=${normalizedPost.category.slug}`}
                            className="px-6 text-sm py-2"
                        />
                    )}
                    <h1
                        className="inline-block mt-6 font-semibold capitalize text-light text-2xl md:text-3xl lg:text-5xl !leading-normal relative w-5/6"
                    >
                        {normalizedPost.title}
                    </h1>
                </div>
                <div className="absolute top-0 left-0 right-0 bottom-0 h-full bg-dark/60 dark:bg-dark/40" />
                <Image
                    src={displayImage}
                    placeholder="blur"
                    blurDataURL={blurImage}
                    alt={normalizedPost.title}
                    width={800}
                    height={600}
                    className="aspect-square w-full h-full object-cover object-center"
                    priority
                    sizes="100vw"
                    unoptimized={isCloudProvider() || isExternalUrl(displayImage)}
                />
            </div>

            <BlogDetails post={normalizedPost} />
            <div className="grid grid-cols-12 gap-y-8 lg:gap-8 sxl:gap-16 mt-8 px-5 md:px-10">
                <TableOfContent mdxContent={normalizedPost.content} scrollContainerId={scrollContainerId} />
                <div className="col-span-12 lg:col-span-8">
                    <RenderMdx mdxSource={mdxSource} additionalComponents={mdxComponents()} />
                </div>
            </div>
            <hr className="my-8 border-slate-200 dark:border-slate-700" />

            <div className="flex justify-center mt-4 pb-10">
                <div className="flex flex-wrap gap-2 justify-center md:gap-4">
                    {normalizedPost.tags && normalizedPost.tags.map((tag: any) => (
                        <Link key={tag.slug || tag.name} href={`/explore?tag=${tag.slug}`} className="bg-light dark:bg-dark text-dark dark:text-light rounded-full px-3 py-1 text-sm font-semibold transition-transform transform hover:scale-105 hover:shadow-lg hover:shadow-slate-500 dark:hover:shadow-slate-700 md:px-4 md:py-2">
                            {tag.name}
                        </Link>
                    ))}
                </div>
            </div>
        </article>
    );
};

export default BlogTemplate;
