import BlogDetails from "@/components/Blog/BlogDetails";
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
import { GetStaticPaths, GetStaticProps } from 'next';
import { serialize } from 'next-mdx-remote/serialize';
import Image from "next/image";
import Link from "next/link";

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
            category: {
                select: {
                    name: true,
                    slug: true,
                },
            },
        },
    });

    if (!post || post.status !== 'published') {
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
        Options
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

import ReadingProgressBar from "@/components/Blog/ReadingProgressBar";
import ShareButtons from "@/components/Blog/ShareButtons";
import Breadcrumb from "@/components/Elements/Breadcrumb";
import siteMetadataShare from "@/lib/siteMetaData";

const BlogPage = ({ post, mdxSource, jsonLd }: any) => {
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
            <ReadingProgressBar />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <article className="mb-8 ">
                <div className="text-center relative w-full h-[70vh] bg-light dark:bg-dark">
                    <div className="w-full z-10 flex flex-col items-center justify-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        {deserializedPost.category && (
                            <Tag
                                name={deserializedPost.category.name}
                                link={`/explore?category=${deserializedPost.category.slug}`}
                                className="px-6 text-sm py-2"
                            />
                        )}
                        <h1
                            className="inline-block mt-6 font-semibold capitalize text-light text-2xl md:text-3xl lg:text-5xl !leading-normal relative w-5/6"
                        >
                            {deserializedPost.title}
                        </h1>
                    </div>
                    <div className="absolute top-0 left-0 right-0 bottom-0 h-full bg-gradient-to-t from-dark/90 via-dark/70 to-transparent" />
                    <Image
                        src={deserializedPost.featured_image_url || '/static/images/default-image.webp'}
                        placeholder="blur"
                        blurDataURL={deserializedPost.featured_image_url || '/static/images/default-image.webp'}
                        alt={deserializedPost.title}
                        width={800}
                        height={600}
                        className="aspect-square w-full h-full object-cover object-center"
                        priority
                        sizes="100vw"
                    />
                </div>

                <Breadcrumb items={[
                    { label: "Blog", href: "/explore" },
                    ...(deserializedPost.category ? [{ label: deserializedPost.category.name, href: `/explore?category=${deserializedPost.category.slug}` }] : []),
                    { label: deserializedPost.title },
                ]} />

                <BlogDetails post={deserializedPost} />
                <div className="grid grid-cols-12 gap-y-8 lg:gap-8 sxl:gap-16 mt-8 px-5 md:px-10">
                    <TableOfContent mdxContent={post.content} />
                    <RenderMdx mdxSource={mdxSource} additionalComponents={mdxComponents()} />
                </div>

                {/* Separator */}
                <hr className="my-8 border-darkBorder" />

                {/* Tags + Share */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 px-5 md:px-10 mb-8">
                    <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                        {deserializedPost.tags && deserializedPost.tags.map((tag: { name: string; slug: string }) => (
                            <Link key={tag.slug} href={`/explore?tag=${tag.slug}`} className="bg-gold/10 text-gold border border-gold/30 rounded-full px-4 py-1.5 text-sm font-semibold transition-all duration-200 hover:bg-gold/20 hover:border-gold/50 hover:scale-105">
                                {tag.name}
                            </Link>
                        ))}
                    </div>
                    <ShareButtons title={deserializedPost.title} slug={deserializedPost.slug} siteUrl={siteMetadataShare.siteUrl} />
                </div>
            </article>
        </>
    );
};

export default BlogPage;