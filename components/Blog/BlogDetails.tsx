"use client";
import { format, parseISO } from "date-fns";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { slug } from "github-slugger";
import { CalendarDays, Clock, UserCircle2, Heart, Bookmark, Eye, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

interface BlogDetailsProps {
  post: any;
}

const BlogDetails = ({ post }: BlogDetailsProps) => {
  const { data: session } = useSession();
  const [interactions, setInteractions] = useState({
    views: post.views || 0,
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

  const toggleLike = async () => {
    if (!session) {
      toast.error("Please sign in to like posts.");
      return;
    }
    // Optimistic update
    setInteractions((prev) => ({
      ...prev,
      hasLiked: !prev.hasLiked,
      likesCount: prev.hasLiked ? prev.likesCount - 1 : prev.likesCount + 1,
    }));
    try {
      const res = await fetch(`/api/posts/${post.slug}/like`, { method: "POST" });
      if (!res.ok) throw new Error();
    } catch {
      // Revert on failure
      setInteractions((prev) => ({
        ...prev,
        hasLiked: !prev.hasLiked,
        likesCount: prev.hasLiked ? prev.likesCount - 1 : prev.likesCount + 1,
      }));
      toast.error("Failed to like post.");
    }
  };

  const toggleBookmark = async () => {
    if (!session) {
      toast.error("Please sign in to bookmark posts.");
      return;
    }
    setInteractions((prev) => ({
      ...prev,
      hasBookmarked: !prev.hasBookmarked,
    }));
    try {
      const res = await fetch(`/api/posts/${post.slug}/bookmark`, { method: "POST" });
      if (!res.ok) throw new Error();
      const data = await res.json();
      toast.success(data.action === 'added' ? "Bookmarked!" : "Removed bookmark");
    } catch {
      setInteractions((prev) => ({
        ...prev,
        hasBookmarked: !prev.hasBookmarked,
      }));
      toast.error("Failed to bookmark post.");
    }
  };

  return (
    <div className="bg-gradient-to-r from-gold/5 via-gold/10 to-gold/5 border border-gold/20 text-foreground py-4 px-6 md:px-10 flex flex-wrap items-center justify-center sm:justify-around font-medium mx-5 md:mx-10 rounded-2xl gap-x-8 gap-y-4 mt-2 mb-8 shadow-sm backdrop-blur-sm">
      <div className="flex items-center gap-2 text-sm md:text-base font-bold opacity-90 group cursor-default">
        <CalendarDays className="w-5 h-5 text-gold group-hover:scale-110 transition-transform" />
        <time>
          {post.published_at ? format(parseISO(post.published_at.toISOString() || post.published_at), "LLLL d, yyyy") : "Unpublished"}
        </time>
      </div>

      <div className="flex items-center gap-2 text-sm md:text-base font-bold opacity-90">
        <UserCircle2 className="w-5 h-5 text-gold" />
        By: <Link href={`/authors/${slug(post.author.username)}`} className="text-gold hover:text-gold/80 hover:underline transition-all">
          @{post.author.username}
        </Link>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-sm md:text-base font-bold opacity-90 group cursor-default" title="Reading time">
          <Clock className="w-5 h-5 text-gold group-hover:scale-110 transition-transform" />
          <span>{post.reading_time} min</span>
        </div>

        {loading ? (
          <Loader2 className="w-5 h-5 text-gold animate-spin" />
        ) : (
          <>
            <div className="flex items-center gap-1.5 text-sm md:text-base font-bold opacity-90" title="Views">
              <Eye className="w-5 h-5 text-gold" />
              <span>{interactions.views}</span>
            </div>

            <button
              onClick={toggleLike}
              className="flex items-center gap-1.5 text-sm md:text-base font-bold opacity-90 hover:opacity-100 transition-opacity"
              title={interactions.hasLiked ? "Unlike post" : "Like post"}
            >
              <Heart className={`w-5 h-5 transition-transform ${interactions.hasLiked ? "fill-red-500 text-red-500" : "text-gold"} active:scale-95`} />
              <span>{interactions.likesCount}</span>
            </button>

            <button
              onClick={toggleBookmark}
              className="flex items-center gap-1.5 text-sm md:text-base font-bold opacity-90 hover:opacity-100 transition-opacity"
              title={interactions.hasBookmarked ? "Remove bookmark" : "Bookmark post"}
            >
              <Bookmark className={`w-5 h-5 transition-transform ${interactions.hasBookmarked ? "fill-gold text-gold" : "text-gold"} active:scale-95`} />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default BlogDetails;