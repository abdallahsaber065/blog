import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import React from "react";

// Define TypeScript types
interface BlogLayoutThreeProps {
  post: {
    slug: string;
    title: string;
    created_at: string;
    updated_at: string;
    published_at: string | null;
    featured_image_url: string;
    tags: { slug: string; name: string }[];
  };
}


const BlogLayoutThree = ({ post }: BlogLayoutThreeProps) => {
  return (
    <div className="group flex flex-col items-center text-dark dark:text-light">
      <Link href={`/blogs/${post.slug}`} className="h-full rounded-xl overflow-hidden">
        <Image
          src={post.featured_image_url || "/static/images/default-image.jpg"}
          placeholder="blur"
          blurDataURL={post.featured_image_url || "/static/images/default-image.jpg"}
          alt={post.title}
          width={800}
          height={600}
          className="aspect-[4/3] w-full h-full object-cover object-center group-hover:scale-105 transition-all ease duration-300"
          sizes="(max-width: 640px) 100vw,(max-width: 1024px) 50vw, 33vw"
        />
      </Link>

      <div className="flex flex-col w-full mt-4">
        {post.tags.length > 0 && (
          <span className="uppercase text-accent dark:text-accentDark font-semibold text-xs sm:text-sm">
            {post.tags[0].name}
          </span>
        )}
        <Link href={`/blogs/${post.slug}`} className="inline-block my-1">
          <h2 className="font-semibold capitalize text-base sm:text-lg">
            <span
              className="bg-gradient-to-r from-accent/50 to-accent/50 dark:from-accentDark/50 dark:to-accentDark/50 bg-[length:0px_6px] group-hover:bg-[length:100%_6px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500"
            >
              {post.title}
            </span>
          </h2>
        </Link>

        <span className="capitalize text-gray dark:text-light/50 font-semibold text-sm sm:text-base">
          {post.published_at ? format(new Date(post.published_at), "MMMM dd, yyyy") : "Unpublished"}
        </span>
      </div>
    </div>
  );
};

export default BlogLayoutThree;