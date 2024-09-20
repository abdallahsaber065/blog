import { format, parseISO } from "date-fns";
import Link from "next/link";
import React from "react";
import { slug } from "github-slugger";
import ViewCounter from "./ViewCounter";
import { Post, Tag } from "@prisma/client";

interface BlogDetailsProps {
  post: Post;
  postSlug: string;
  tags: Tag[];
}

const BlogDetails = ({ post, postSlug, tags }: BlogDetailsProps) => {
  return (
    <div className="px-2 md:px-10 bg-accent dark:bg-accentDark text-light dark:text-dark py-2 flex items-center justify-around flex-wrap text-lg sm:text-xl font-medium mx-5 md:mx-10 rounded-lg">
      <time className="m-3">
        {post.published_at ? format(parseISO(post.published_at.toISOString()), "LLLL d, yyyy") : "Unpublished"}
      </time>
      <span className="m-3">
        <ViewCounter slug={postSlug} />
      </span>
      <div className="m-3">{post.reading_time}</div>
      {tags.length > 0 && (
        <Link href={`/categories/${slug(tags[0].name)}`} className="m-3">
          #{tags[0].name}
        </Link>
      )}
    </div>
  );
};

export default BlogDetails;