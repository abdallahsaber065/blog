import React, { useEffect, useState } from "react";
import RenderMdx from "@/components/Blog/RenderMdx";
import Image from "next/image";
import Tag from "@/components/Elements/Tag";
import CustomImage from '@/components/Image/CustomImageView';
import TableOfContent from "@/components/Blog/TableOfContenet";
import { serialize } from 'next-mdx-remote/serialize';
import { SerializeOptions } from "next-mdx-remote/dist/types";

const BlogPreview = ({ mdxText }: { mdxText: string }) => {
    const [mdxSource, setMdxSource] = useState<any>(null);

    useEffect(() => {
        const fetchMdxSource = async () => {
            const source = await serialize(mdxText, {} as SerializeOptions);
            setMdxSource(source);
        };
        fetchMdxSource();
    }, [mdxText]);

    const placeholderPost = {
        title: "Placeholder Title",
        tags: [{ name: "Placeholder Tag", slug: "placeholder-tag" }],
        featured_image_url: "http://localhost:3000/blogs/c-d-x-PDX_a_82obo-unsplash.jpg",
        content: mdxText,
    };

    const mdxComponents = () => ({
        Image: (props: any) => <CustomImage {...props} />,
        img: (props: any) => <CustomImage {...props} />,
    });

    return (
        <article>
            <div className="mb-8 text-center relative w-full h-[70vh] bg-dark">
                <div className="w-full z-10 flex flex-col items-center justify-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <Tag
                        name={placeholderPost.tags[0].name}
                        link={`/categories/${placeholderPost.tags[0].slug}`}
                        className="px-6 text-sm py-2"
                    />
                    <h1
                        className="inline-block mt-6 font-semibold capitalize text-light text-2xl md:text-3xl lg:text-5xl !leading-normal relative w-5/6"
                    >
                        {placeholderPost.title}
                    </h1>
                </div>
                <div className="absolute top-0 left-0 right-0 bottom-0 h-full bg-dark/60 dark:bg-dark/40" />
                <Image
                    src={placeholderPost.featured_image_url}
                    placeholder="blur"
                    blurDataURL={placeholderPost.featured_image_url}
                    alt={placeholderPost.title}
                    width={800}
                    height={600}
                    className="aspect-square w-full h-full object-cover object-center"
                    priority
                    sizes="100vw"
                />
            </div>

            <div className="grid grid-cols-12 gap-y-8 lg:gap-8 sxl:gap-16 mt-8 px-5 md:px-10">
                <TableOfContent mdxContent={placeholderPost.content} />
                {mdxSource && <RenderMdx mdxSource={mdxSource} additionalComponents={mdxComponents()} />}
            </div>
        </article>
    );
};

export default BlogPreview;