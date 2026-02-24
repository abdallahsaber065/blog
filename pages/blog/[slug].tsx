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
import { resolvePublicUrl, isCloudProvider, isExternalUrl } from "@/lib/storage";

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
                    id: true,
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
import PostActions from "@/components/Blog/PostActions";
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
                <div className="relative w-full min-h-[50vh] sm:min-h-[60vh] md:min-h-[70vh] bg-light dark:bg-dark flex items-center justify-center pt-24 pb-12 overflow-hidden">
                    <div className="absolute inset-0 z-0">
                        <Image
                            src={deserializedPost.featured_image_url ? resolvePublicUrl(deserializedPost.featured_image_url) : '/static/images/default-image.webp'}
                            placeholder="blur"
                            blurDataURL={deserializedPost.featured_image_url ? resolvePublicUrl(deserializedPost.featured_image_url) : '/static/images/default-image.webp'}
                            alt={deserializedPost.title}
                            fill
                            className="object-cover object-center"
                            priority
                            sizes="100vw"
                            unoptimized={isCloudProvider() || (deserializedPost.featured_image_url ? isExternalUrl(resolvePublicUrl(deserializedPost.featured_image_url)) : false)}
                        />
                        <div className="absolute inset-0 bg-dark/60 z-10 transition-opacity" />
                        <div className="absolute inset-0 bg-gradient-to-t from-dark/95 via-dark/70 to-transparent z-10" />
                    </div>

                    <div className="relative z-20 w-full px-5 md:px-10 flex flex-col items-center text-center mt-12">
                        {deserializedPost.category && (
                            <Tag
                                name={deserializedPost.category.name}
                                link={`/explore?category=${deserializedPost.category.slug}`}
                                className="px-6 text-sm py-2 mb-6 shadow-xl"
                            />
                        )}
                        <h1 className="font-bold capitalize text-light text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight sm:!leading-snug max-w-5xl break-words w-full drop-shadow-lg">
                            {deserializedPost.title}
                        </h1>
                    </div>
                </div>

                <Breadcrumb
                    items={[
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
                    <div className="flex items-center gap-4">
                        <PostActions postSlug={deserializedPost.slug} />
                        <ShareButtons title={deserializedPost.title} slug={deserializedPost.slug} siteUrl={siteMetadataShare.siteUrl} />
                    </div>
                </div>
            </article>
        </>
    );
};

export default BlogPage;