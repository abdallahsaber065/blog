import { sortPosts } from "@/lib";
import Link from "next/link";
import React from "react";
import BlogLayoutThree from "../Blog/BlogLayoutThree";
import { Post, Tag as PrismaTag } from "@prisma/client";

interface PostWithTags extends Post {
  tags: PrismaTag[];
}

interface RecentPostsProps {
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

const RecentPosts = ({ posts }: RecentPostsProps) => {
  return (
    <section className="w-full mt-16 sm:mt-24 md:mt-32 px-5 sm:px-10 md:px-24 sxl:px-32 flex flex-col items-center justify-center">
      <div className="w-full flex justify-between">
        <h2 className="w-fit inline-block font-bold capitalize text-2xl md:text-4xl text-dark dark:text-light">Recent Posts</h2>
        <Link href="/tags/all" className="inline-block font-medium text-accent dark:text-accentDark underline underline-offset-2 text-base md:text-lg">
          view all
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 grid-rows-2 gap-16 mt-16">
        {posts.slice(4, 10).map((post, index) => {
          return (
            <article key={index} className="col-span-1 row-span-1 relative">
              <BlogLayoutThree post={post} />
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default RecentPosts;