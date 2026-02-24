"use client";
import { format, parseISO } from "date-fns";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { slug } from "github-slugger";
import { CalendarDays, Clock, UserCircle2, Heart, Bookmark, Eye, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";

interface BlogDetailsProps {
  post: any;
}

const BlogDetails = ({ post }: BlogDetailsProps) => {
  const { data: session } = useSession();
  const [interactions, setInteractions] = useState({
    views: post.views || 1,
    likesCount: 0,
    hasLiked: false,
    hasBookmarked: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInteractions = async () => {
      try {
        // Record view first
        await fetch(`/api/posts/${post.slug}/view`, { method: "POST" });

        // Fetch interactions state
        const res = await fetch(`/api/posts/${post.slug}/interactions`);
        if (res.ok) {
          const data = await res.json();
          setInteractions(data);
        }
      } catch (e) {
        console.error("Error fetching interactions", e);
      } finally {
        setLoading(false);
      }
    };
    fetchInteractions();
  }, [post.slug]);

  const canViewStats = session?.user?.role === 'admin' || session?.user?.id === String(post.author?.id);

  return (
    <div className="bg-transparent md:bg-gradient-to-r md:from-gold/5 md:via-gold/10 md:to-gold/5 border-y md:border border-gold/10 md:border-gold/20 text-foreground py-3 md:py-4 px-4 md:px-10 flex flex-wrap items-center justify-start md:justify-around text-xs md:text-sm md:font-medium mx-0 md:mx-10 md:rounded-2xl gap-x-6 gap-y-3 mt-4 mb-4 md:mb-8 md:shadow-sm md:backdrop-blur-sm">

      <div className="flex items-center gap-2 text-sm md:text-base font-bold opacity-90 group cursor-default">
        <UserCircle2 className="w-5 h-5 text-gold" />
        By: <Link href={`/authors/${slug(post.author.username)}`} className="text-gold hover:text-gold/80 hover:underline transition-all">
          @{post.author.username}
        </Link>
      </div>

      <div className="flex items-center gap-2 text-sm md:text-base font-bold opacity-90 mr-auto md:m-0">
        <CalendarDays className="w-5 h-5 text-gold group-hover:scale-110 transition-transform" />
        <time>
          {post.published_at ? format(parseISO(post.published_at.toISOString() || post.published_at), "LLLL d, yyyy") : "Unpublished"}
        </time>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-sm md:text-base font-bold opacity-90 group cursor-default" title="Reading time">
          <Clock className="w-5 h-5 text-gold group-hover:scale-110 transition-transform" />
          <span>{post.reading_time} min</span>
        </div>

        {loading ? (
          <Loader2 className="w-5 h-5 text-gold animate-spin" />
        ) : (
          canViewStats && (
            <div className="flex items-center gap-1.5 text-sm md:text-base font-bold opacity-90" title="Views">
              <Eye className="w-5 h-5 text-gold" />
              <span>{interactions.views}</span>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default BlogDetails;