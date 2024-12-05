// components/Blog/BlogPreview.tsx
import React from "react";
import RenderMdx from "@/components/Blog/RenderMdx";
import Image from "next/image";
import Tag from "@/components/Elements/Tag";
import CustomImage from '@/components/MdxComponents/Image/CustomImageView';
import CustomFileView from '@/components/MdxComponents/File/CustomFileView';
import TableOfContent from "@/components/Blog/TableOfContenet";
import { serialize } from 'next-mdx-remote/serialize';
import { SerializeOptions } from "next-mdx-remote/dist/types";
import { Options } from "@/lib/articles/mdxconfig";
import { GetServerSideProps } from 'next';
import InlineFileView from "../MdxComponents/File/InlineFileView";
import FileResource from "../MdxComponents/File/FileResource";
import Embed from '@/components/MdxComponents/Embed/Embed';
import dotenv from 'dotenv';

dotenv.config();



interface BlogPreviewProps {
    mdxSource: any;
    mdxText: string;
}

const BlogPreview: React.FC<BlogPreviewProps> = ({ mdxSource, mdxText }) => {
    const placeholderPost = {
        title: "Placeholder Title",
        tags: [{ name: "Placeholder Tag", slug: "placeholder-tag" }],
        featured_image_url: `${process.env.NEXT_PUBLIC_BASE_URL}/blogs/c-d-x-PDX_a_82obo-unsplash.jpg`,
        content: mdxText,
    };

    const mdxComponents = () => ({
        Image: (props: any) => <CustomImage {...props} />,
        img: (props: any) => <CustomImage {...props} />,
        File: (props: any) => <CustomFileView {...props} />,
        file: (props: any) => <CustomFileView {...props} />,
        InlineFile: (props: any) => <InlineFileView {...props} />,
        FileResource: (props: any) => <FileResource {...props} />,
        Embed: (props: any) => <Embed {...props} />,
    });

    return (
        <article>
            <div className="mb-8 text-center relative w-full h-[70vh] bg-dark">
                <div className="w-full z-10 flex flex-col items-center justify-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <Tag
                        name={placeholderPost.tags[0].name}
                        link={`/tags/${placeholderPost.tags[0].slug}`}
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
                <div className="col-span-12 lg:col-span-3">
                    <div className="sticky top-20">
                        <TableOfContent mdxContent={placeholderPost.content} />
                    </div>
                </div>
                <div className="col-span-12 lg:col-span-9">
                    {mdxSource && <RenderMdx mdxSource={mdxSource} additionalComponents={mdxComponents()} />}
                </div>
            </div>
        </article>
    );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
    const mdxText = "Your MDX content here"; // Replace with your actual MDX content

    // Serialize the MDX content
    const mdxSource = await serialize(mdxText, Options as SerializeOptions);

    return {
        props: {
            mdxSource,
            mdxText,
        },
    };
};

export default BlogPreview;