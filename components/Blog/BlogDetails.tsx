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
    <div className="px-4 md:px-10 bg-gold/10 border border-gold/20 text-foreground py-2.5 flex items-center justify-around flex-wrap text-sm font-medium mx-5 md:mx-10 rounded-xl gap-y-1">
      <time className="mb-1 md:mb-0 md:mr-2 text-sm md:text-base font-bold">
        {post.published_at ? format(parseISO(post.published_at.toISOString()), "LLLL d, yyyy") : "Unpublished"}
      </time>

      <div className="flex items-center mb-1 md:mb-0 md:mr-2 text-sm font-bold">
        By: <Link href={`/authors/${slug(post.author.username)}`} className="ml-1 text-gold hover:underline">
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