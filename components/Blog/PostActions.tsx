"use client";

import { useState, useEffect } from "react";
import { Heart, Bookmark, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

interface PostActionsProps {
    postSlug: string;
}

const PostActions = ({ postSlug }: PostActionsProps) => {
    const { data: session } = useSession();
    const [interactions, setInteractions] = useState({
        likesCount: 0,
        hasLiked: false,
        hasBookmarked: false,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInteractions = async () => {
            try {
                const res = await fetch(`/api/posts/${postSlug}/interactions`);
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
    }, [postSlug]);

    const toggleLike = async () => {
        if (!session) {
            toast.error("Please sign in to like posts.");
            return;
        }
        setInteractions((prev) => ({
            ...prev,
            hasLiked: !prev.hasLiked,
            likesCount: prev.hasLiked ? prev.likesCount - 1 : prev.likesCount + 1,
        }));
        try {
            const res = await fetch(`/api/posts/${postSlug}/like`, { method: "POST" });
            if (!res.ok) throw new Error();
        } catch {
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
            const res = await fetch(`/api/posts/${postSlug}/bookmark`, { method: "POST" });
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

    if (loading) {
        return (
            <div className="flex items-center gap-4 text-gold">
                <Loader2 className="w-5 h-5 animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex items-center gap-4">
            <button
                onClick={toggleLike}
                className="flex items-center gap-2 px-4 py-2 border border-darkBorder hover:border-gold/40 rounded-xl text-sm font-medium text-muted-foreground hover:text-gold transition-all duration-200"
                title={interactions.hasLiked ? "Unlike post" : "Like post"}
            >
                <Heart className={`w-4 h-4 transition-transform ${interactions.hasLiked ? "fill-red-500 text-red-500" : ""} active:scale-95`} />
                <span className="hidden sm:inline-block">{interactions.likesCount} {interactions.likesCount === 1 ? 'Like' : 'Likes'}</span>
                <span className="sm:hidden">{interactions.likesCount}</span>
            </button>

            <button
                onClick={toggleBookmark}
                className="flex items-center gap-2 px-4 py-2 border border-darkBorder hover:border-gold/40 rounded-xl text-sm font-medium text-muted-foreground hover:text-gold transition-all duration-200"
                title={interactions.hasBookmarked ? "Remove bookmark" : "Bookmark post"}
            >
                <Bookmark className={`w-4 h-4 transition-transform ${interactions.hasBookmarked ? "fill-gold text-gold" : ""} active:scale-95`} />
                <span className="hidden sm:inline-block">{interactions.hasBookmarked ? "Saved" : "Save"}</span>
            </button>
        </div>
    );
};

export default PostActions;
