import { format, parseISO } from "date-fns";
import Link from "next/link";
import React from "react";
import { slug } from "github-slugger";
import { Tag } from "@prisma/client";

interface BlogDetailsProps {
  post: any;
}

const BlogDetails = ({ post}: BlogDetailsProps) => {
  return (
    <div className="px-2 md:px-10 bg-accent dark:bg-accentDark text-light dark:text-dark py-2 flex items-center justify-around flex-wrap text-lg sm:text-xl font-medium mx-5 md:mx-10 rounded-lg">
      <time className="mb-1 md:mb-0 md:mr-2 text-sm md:text-base font-bold">
        {post.published_at ? format(parseISO(post.published_at.toISOString()), "LLLL d, yyyy") : "Unpublished"}
      </time>

      <div className="flex items-center mb-1 md:mb-0 md:mr-2 text-sm md:text-base font-bold">
        By: <Link href={`/authors/${slug(post.author.username)}`} className="ml-1 text-accentDark dark:text-accent hover:underline">
          @{post.author.username}
        </Link>
      </div>

      <div className="mb-1 md:mb-0 md:mr-2 text-sm md:text-base font-bold">
        {post.reading_time} min read
      </div>

    </div>
  );
};

export default BlogDetails;