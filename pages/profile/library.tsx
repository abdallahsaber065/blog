import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, Heart, Loader2 } from 'lucide-react';
import BlogLayoutThree from '@/components/Blog/BlogLayoutThree';

export default function UserLibrary() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [activeTab, setActiveTab] = useState<'saved' | 'liked'>('saved');
    const [libraryData, setLibraryData] = useState<{ bookmarkedPosts: any[], likedPosts: any[] }>({
        bookmarkedPosts: [],
        likedPosts: [],
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        }
    }, [status, router]);

    useEffect(() => {
        const fetchLibrary = async () => {
            if (status !== 'authenticated') return;
            try {
                const res = await fetch('/api/user/library');
                if (res.ok) {
                    const data = await res.json();
                    // Deserialize dates
                    const deserializeDates = (posts: any[]) => posts.map(post => ({
                        ...post,
                        created_at: new Date(post.created_at),
                        updated_at: new Date(post.updated_at),
                        published_at: post.published_at ? new Date(post.published_at) : null,
                    }));
                    setLibraryData({
                        bookmarkedPosts: deserializeDates(data.bookmarkedPosts),
                        likedPosts: deserializeDates(data.likedPosts)
                    });
                }
            } catch (error) {
                console.error('Failed to fetch library:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchLibrary();
    }, [status]);

    if (status === 'loading' || (loading && status === 'authenticated')) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-gold animate-spin" />
            </div>
        );
    }

    if (!session) return null;

    const currentPosts = activeTab === 'saved' ? libraryData.bookmarkedPosts : libraryData.likedPosts;

    return (
        <>
            <Head>
                <title>My Library | DevTrend</title>
            </Head>
            <main className="w-full flex flex-col items-center justify-center px-4 sm:px-8 md:px-16 sxl:px-24 py-12 sm:py-20 mt-16 min-h-[80vh]">
                <div className="w-full max-w-6xl">
                    {/* Header */}
                    <div className="mb-12 text-center space-y-4">
                        <motion.h1
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                            className="text-4xl md:text-5xl font-display font-bold text-foreground"
                        >
                            My <span className="text-transparent bg-clip-text bg-gold-gradient">Library</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="text-muted-foreground text-lg"
                        >
                            Your personal collection of favorite articles and saved reads.
                        </motion.p>
                    </div>

                    {/* Tabs */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                        className="flex justify-center mb-10"
                    >
                        <div className="flex p-1 space-x-1 bg-darkSurface dark:bg-darkSurface border border-lightBorder dark:border-darkBorder rounded-xl relative shadow-sm">
                            <button
                                onClick={() => setActiveTab('saved')}
                                className={`relative flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 z-10 ${activeTab === 'saved' ? 'text-dark' : 'text-foreground/70 hover:text-foreground'
                                    }`}
                            >
                                <Bookmark className="w-4 h-4" />
                                Saved
                                {activeTab === 'saved' && (
                                    <motion.div
                                        layoutId="library-active-tab"
                                        className="absolute inset-0 bg-gold rounded-lg -z-10 shadow-gold-sm"
                                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                    />
                                )}
                            </button>
                            <button
                                onClick={() => setActiveTab('liked')}
                                className={`relative flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 z-10 ${activeTab === 'liked' ? 'text-dark' : 'text-foreground/70 hover:text-foreground'
                                    }`}
                            >
                                <Heart className={`w-4 h-4 ${activeTab === 'liked' ? 'fill-dark' : ''}`} />
                                Liked
                                {activeTab === 'liked' && (
                                    <motion.div
                                        layoutId="library-active-tab"
                                        className="absolute inset-0 bg-gold rounded-lg -z-10 shadow-gold-sm"
                                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                    />
                                )}
                            </button>
                        </div>
                    </motion.div>

                    {/* Content List */}
                    <div className="min-h-[400px]">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3, ease: 'easeOut' }}
                                className="w-full"
                            >
                                {currentPosts.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                                        {currentPosts.map((post, index) => (
                                            <motion.article
                                                key={`${post.slug}-${index}`}
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ duration: 0.4, delay: index * 0.05 }}
                                            >
                                                <BlogLayoutThree post={post} />
                                            </motion.article>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                                        <div className="w-20 h-20 bg-darkSurface border border-darkBorder rounded-full flex items-center justify-center opacity-50 mb-4">
                                            {activeTab === 'saved' ? <Bookmark className="w-8 h-8 text-gold" /> : <Heart className="w-8 h-8 text-gold" />}
                                        </div>
                                        <h3 className="text-2xl font-bold text-foreground">Nothing here yet</h3>
                                        <p className="text-muted-foreground max-w-sm">
                                            {activeTab === 'saved'
                                                ? "You haven't saved any articles. Click the bookmark icon on any post to read it later."
                                                : "You haven't liked any articles yet. Show some love to posts you enjoy!"}
                                        </p>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </main>
        </>
    );
}
