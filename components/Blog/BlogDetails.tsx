import { format, parseISO } from "date-fns";
import Link from "next/link";
import React from "react";
import { slug } from "github-slugger";
import { Tag } from "@prisma/client";
import { CalendarDays, Clock, UserCircle2 } from "lucide-react";

interface BlogDetailsProps {
  post: any;
}

const BlogDetails = ({ post }: BlogDetailsProps) => {
  return (
    <div className="bg-gradient-to-r from-gold/5 via-gold/10 to-gold/5 border border-gold/20 text-foreground py-4 px-6 md:px-10 flex flex-wrap items-center justify-center sm:justify-around font-medium mx-5 md:mx-10 rounded-2xl gap-x-8 gap-y-4 mt-2 mb-8 shadow-sm backdrop-blur-sm">
      <div className="flex items-center gap-2 text-sm md:text-base font-bold opacity-90 group cursor-default">
        <CalendarDays className="w-5 h-5 text-gold group-hover:scale-110 transition-transform" />
        <time>
          {post.published_at ? format(parseISO(post.published_at.toISOString()), "LLLL d, yyyy") : "Unpublished"}
        </time>
      </div>

      <div className="flex items-center gap-2 text-sm md:text-base font-bold opacity-90">
        <UserCircle2 className="w-5 h-5 text-gold" />
        By: <Link href={`/authors/${slug(post.author.username)}`} className="text-gold hover:text-gold/80 hover:underline transition-all">
          @{post.author.username}
        </Link>
      </div>

      <div className="flex items-center gap-2 text-sm md:text-base font-bold opacity-90 group cursor-default">
        <Clock className="w-5 h-5 text-gold group-hover:scale-110 transition-transform" />
        <span>{post.reading_time} min read</span>
      </div>
    </div>
  );
};

export default BlogDetails;