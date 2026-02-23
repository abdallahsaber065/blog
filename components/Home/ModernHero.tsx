import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar } from 'lucide-react';

interface HeroPost {
    id: string;
    slug: string;
    title: string;
    excerpt: string | null;
    published_at: Date | null;
    featured_image_url: string | null;
    category: { name: string; slug: string } | null;
}

interface ModernHeroProps {
    post: HeroPost;
}

const ModernHero: React.FC<ModernHeroProps> = ({ post }) => {
    if (!post) return null;

    const formattedDate = post.published_at
        ? new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(post.published_at))
        : 'Recent';

    // Fallback high-quality Unsplash image
    const fallbackImage = 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop';

    return (
        <section className="relative w-full min-h-[85vh] flex items-center justify-center overflow-hidden bg-dark">
            {/* Background Image & Overlay */}
            <div className="absolute inset-0 z-0">
                <motion.img
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                    src={post.featured_image_url || fallbackImage}
                    alt={post.title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-dark/85 bg-gradient-to-t from-dark via-dark/60 to-transparent"></div>
                {/* Subtle radial glow */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(248,204,77,0.1)_0%,transparent_60%)]"></div>
            </div>

            <div className="container relative z-10 px-4 md:px-8 mt-16 md:mt-24">
                <div className="max-w-4xl mx-auto text-center flex flex-col items-center">

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    >
                        {post.category && (
                            <span className="inline-block py-1.5 px-4 rounded-full bg-gold/10 text-gold text-sm font-medium tracking-wider mb-6 border border-gold/20 backdrop-blur-md">
                                {post.category.name}
                            </span>
                        )}
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight text-light mb-6 leading-tight font-display"
                    >
                        {post.title}
                    </motion.h1>

                    {post.excerpt && post.excerpt !== post.title && (
                        <motion.p
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                            className="text-lg md:text-xl text-light/70 mb-10 max-w-2xl font-inter leading-relaxed"
                        >
                            {post.excerpt}
                        </motion.p>
                    )}

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-6"
                    >
                        <Link
                            href={`/blog/${post.slug}`}
                            className="group relative inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold text-dark bg-gold rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-gold-sm hover:shadow-gold"
                        >
                            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-gold to-goldLight opacity-0 group-hover:opacity-100 transition-opacity"></span>
                            <span className="relative flex items-center gap-2">
                                Read Article
                                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                            </span>
                        </Link>
                    </motion.div>
                </div>
            </div>

            {/* Scroll indicator overlay at bottom */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 1 }}
                className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
            >
                <div className="w-[1px] h-10 md:h-6 bg-gradient-to-b from-gold/50 to-transparent"></div>
                <span className="text-light/40 text-xs uppercase tracking-widest font-medium">Scroll to explore</span>
            </motion.div>
        </section>
    );
};

export default ModernHero;
