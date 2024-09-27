import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Post, Tag as PrismaTag } from "@prisma/client";

interface BlogLayoutTwoProps {
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

const BlogLayoutTwo = ({ post }: BlogLayoutTwoProps) => {
  return (
    <div className="group grid grid-cols-12 gap-4 items-center text-dark dark:text-light">
      <Link
        href={`/blogs/${post.slug}`}
        className="col-span-12 lg:col-span-4 h-full rounded-xl overflow-hidden"
      >
        <Image
          src={post.featured_image_url || "/default-image.jpg"}
          placeholder="blur"
          blurDataURL={post.featured_image_url || "/default-image.jpg"}
          alt={post.title}
          width={800}
          height={600}
          className="aspect-square w-full h-full object-cover object-center group-hover:scale-105 transition-all ease duration-300"
          sizes="(max-width: 640px) 100vw,(max-width: 1024px) 50vw, 33vw"
        />
      </Link>

      <div className="col-span-12 lg:col-span-8 w-full">
        {post.tags.length > 0 && (
          <span className="inline-block w-full uppercase text-accent dark:text-accentDark font-semibold text-xs sm:text-sm">
            {post.tags[0].name}
          </span>
        )}
        <Link href={`/blogs/${post.slug}`} className="inline-block my-1">
          <h2 className="font-semibold capitalize text-base sm:text-lg">
            <span
              className="bg-gradient-to-r from-accent/50 dark:from-accentDark/50 to-accent/50 dark:to-accentDark/50 bg-[length:0px_6px]
                group-hover:bg-[length:100%_6px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 "
            >
              {post.title}
            </span>
          </h2>
        </Link>

        <span className="inline-block w-full capitalize text-gray dark:text-light/50 font-semibold text-xs sm:text-base">
          {post.published_at ? format(new Date(post.published_at), "MMMM dd, yyyy") : "Unpublished"}
        </span>
      </div>
    </div>
  );
};

export default BlogLayoutTwo;