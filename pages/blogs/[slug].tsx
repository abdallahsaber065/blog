import BlogDetails from "@/components/Blog/BlogDetails";
import RenderMdx from "@/components/Blog/RenderMdx";
import Image from "next/image";
import Tag from "@/components/Elements/Tag";
import siteMetadata from "@/lib/siteMetaData";
import { generateTOC } from "@/lib";
import { serialize } from 'next-mdx-remote/serialize';
import { options } from "@/lib/articles/mdxconfig";
import { GetStaticPaths, GetStaticProps } from 'next';
import { prisma } from '@/lib/prisma';

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

export const getStaticProps: GetStaticProps = async ({ params }) => {
    const { slug } = params as { slug: string };

    const post = await prisma.post.findUnique({
        where: { slug },
        select: {
            slug: true,
            title: true,
            content: true,
            excerpt: true,
            featured_image_url: true,
            created_at: true,
            updated_at: true,
            published_at: true,
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

    const toc = generateTOC(post.content);
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

    // Serialize the post content
    const mdxSource = await serialize(
        post.content,
        options as any
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
            toc,
            mdxSource,
            jsonLd,
        },
        revalidate: 3600, // Revalidate every hour (1 hour = 3600 seconds)
    };
};

const BlogPage = ({ post, toc, mdxSource, jsonLd }: any) => {
    // Convert strings back to Date objects
    const deserializedPost = {
        ...post,
        created_at: new Date(post.created_at),
        updated_at: new Date(post.updated_at),
        published_at: post.published_at ? new Date(post.published_at) : null,
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <article>
                <div className="mb-8 text-center relative w-full h-[70vh] bg-dark">
                    <div className="w-full z-10 flex flex-col items-center justify-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <Tag
                            name={deserializedPost.tags[0].name}
                            link={`/categories/${deserializedPost.tags[0].slug}`}
                            className="px-6 text-sm py-2"
                        />
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
                    <div className="col-span-12 lg:col-span-4">
                        <details
                            className="border-[1px] border-solid border-dark dark:border-light text-dark dark:text-light rounded-lg p-4 sticky top-6 max-h-[80vh] overflow-hidden overflow-y-auto"
                            open
                        >
                            <summary className="text-lg font-semibold capitalize cursor-pointer">
                                Table Of Content
                            </summary>
                            <ul className="mt-4 font-in text-base">
                                {toc.map((heading: any) => (
                                    <li key={`#${heading.slug}`} className="py-1">
                                        <a
                                            href={`#${heading.slug}`}
                                            data-level={heading.level}
                                            className="data-[level=two]:pl-0  data-[level=two]:pt-2
                        data-[level=two]:border-t border-solid
                        data-[level=three]:pl-4
                        sm:data-[level=three]:pl-6
                        flex items-center justify-start
                      "
                                        >
                                            {heading.level === "three" && (
                                                <span className="flex w-1 h-1 rounded-full mr-2">
                                                    &nbsp;
                                                </span>
                                            )}
                                            <span className="hover:underline">{heading.text}</span>
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </details>
                    </div>
                    <RenderMdx post={deserializedPost} mdxSource={mdxSource} />
                </div>
            </article>
        </>
    );
};

export default BlogPage;