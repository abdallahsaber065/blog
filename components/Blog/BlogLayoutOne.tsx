import React from "react";
import Tag from "../Elements/Tag";
import Link from "next/link";
import Image from "next/image";
import { slug } from "github-slugger";
import { Post, Tag as PrismaTag } from "@prisma/client";

interface BlogLayoutOneProps {
  post: {
    slug: string;
    title: string;
    excerpt: string;
    created_at: string;
    updated_at: string;
    published_at: string | null;
    featured_image_url: string;
    tags: { slug: string; name: string }[];
  };
}

const BlogLayoutOne = ({ post }: BlogLayoutOneProps) => {
  return (
    <div className="group inline-block overflow-hidden rounded-xl">
      <div
        className="absolute top-0 left-0 bottom-0 right-0 h-full
            bg-gradient-to-b from-transparent from-0% to-dark/90 rounded-xl z-10
            "
      />
      <Image
        src={post.featured_image_url || "/default-image.jpg"}
        placeholder="blur"
        blurDataURL={post.featured_image_url || "/default-image.jpg"}
        alt={post.title}
        width={800}
        height={600}
        className="w-full h-full object-center object-cover rounded-xl group-hover:scale-105 transition-all ease duration-300"
        sizes="(max-width: 1180px) 100vw, 50vw"
      />

      <div className="w-full absolute bottom-0 p-4 xs:p-6 sm:p-10 z-20">
        {post.tags.length > 0 && (
          <Tag
            link={`/categories/${slug(post.tags[0].name)}`}
            name={post.tags[0].name}
            className="px-6 text-xs sm:text-sm py-1 sm:py-2 !border"
          />
        )}
        <Link href={`/blogs/${post.slug}`} className="mt-6">
          <h2 className="font-bold capitalize text-sm xs:text-base sm:text-xl md:text-2xl text-light mt-2 sm:mt-4">
            <span
              className="bg-gradient-to-r from-accent to-accent bg-[length:0px_6px] dark:from-accentDark/50 dark:to-accentDark/50
                group-hover:bg-[length:100%_6px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 "
            >
              {post.title}
            </span>
          </h2>
        </Link>
      </div>
    </div>
  );
};

export default BlogLayoutOne;