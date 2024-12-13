import React from "react";
import BlogLayoutOne from "../Blog/BlogLayoutOne";
import BlogLayoutTwo from "../Blog/BlogLayoutTwo";
import { Post, Tag as PrismaTag } from "@prisma/client";

interface FeaturedPostsProps {
  posts: {
    slug: string;
    title: string;
    excerpt: string;
    created_at: string;
    updated_at: string;
    published_at: string | null;
    featured_image_url: string;
    tags: { slug: string; name: string }[];
    category: { slug: string; name: string } | null;
  }[];
}

const FeaturedPosts = ({ posts }: FeaturedPostsProps) => {

  return (
  <section className="w-full mt-16 sm:mt-24  md:mt-32 px-5 sm:px-10 md:px-24  sxl:px-32 flex flex-col items-center justify-center">
    <h2 className="w-full inline-block font-bold capitalize text-2xl md:text-4xl text-dark dark:text-light">Featured Posts</h2>

    <div className="grid grid-cols-2 grid-rows-2 gap-6  mt-10 sm:mt-16">
      <article className=" col-span-2  sxl:col-span-1 row-span-2 relative">
        <BlogLayoutOne post={posts[1]} />
      </article>
      <article className=" col-span-2 sm:col-span-1 row-span-1 relative">
          <BlogLayoutTwo post={posts[2]} />

      </article>
      <article className="col-span-2 sm:col-span-1 row-span-1 relative">
          <BlogLayoutTwo post={posts[3]} />

      </article>
    </div>
  </section>
  );
};

export default FeaturedPosts;