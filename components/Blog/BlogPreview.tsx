// components/Blog/BlogPreview.tsx
import React from "react";
import RenderMdx from "@/components/Blog/RenderMdx";
import Image from "next/image";
import Tag from "@/components/Elements/Tag";
import CustomImage from '@/components/MdxComponents/Image/CustomImageView';
import CustomFileView from '@/components/MdxComponents/File/CustomFileView';
import { serialize } from 'next-mdx-remote/serialize';
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
        featured_image_url: `${process.env.NEXT_PUBLIC_BASE_URL}/blog/c-d-x-PDX_a_82obo-unsplash.webp`,
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
            <div className="grid grid-cols-12 gap-y-8 lg:gap-8 sxl:gap-16 mt-8 px-5 md:px-10">

                <div className="col-span-12 lg:col-span-8">
                    {mdxSource && <RenderMdx mdxSource={mdxSource} additionalComponents={mdxComponents()} />}
                </div>
            </div>
        </article>
    );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
    const mdxText = "Your MDX content here"; // Replace with your actual MDX content

    // Serialize the MDX content
    const mdxSource = await serialize(mdxText, Options);

    return {
        props: {
            mdxSource,
            mdxText,
        },
    };
};

export default BlogPreview;