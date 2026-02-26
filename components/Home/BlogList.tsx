import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import BlogCard, { Post } from '../Blog/BlogCard';

interface BlogListProps {
    title: string;
    description?: string;
    posts: Post[];
    highlightFirst?: boolean;
}

const BlogList: React.FC<BlogListProps> = ({ title, description, posts, highlightFirst = false }) => {
    if (!posts || posts.length === 0) return null;

    return (
        <section className="py-12 md:py-16 bg-dark">
            <div className="container px-4 md:px-8">

                {/* ── Section header ── */}
                <div className="flex items-end justify-between gap-6 mb-10 md:mb-12">
                    <div className="flex items-start gap-4">
                        {/* Gold accent bar */}
                        <div className="mt-1.5 w-1 h-10 rounded-full bg-gold/70 shrink-0" />
                        <div>
                            <motion.h2
                                initial={{ opacity: 0, x: -16 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true, margin: '-80px' }}
                                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                                className="text-2xl md:text-3xl font-bold font-display text-light leading-tight"
                            >
                                {title}
                            </motion.h2>
                            {description && (
                                <motion.p
                                    initial={{ opacity: 0, x: -16 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true, margin: '-80px' }}
                                    transition={{ duration: 0.55, delay: 0.07, ease: [0.16, 1, 0.3, 1] }}
                                    className="text-sm text-light/50 font-inter mt-1"
                                >
                                    {description}
                                </motion.p>
                            )}
                        </div>
                    </div>

                    {/* View all link */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.15 }}
                        className="shrink-0"
                    >
                        <Link
                            href="/explore"
                            className="group inline-flex items-center gap-1.5 text-sm font-semibold text-gold/80
                                       hover:text-gold transition-colors duration-200"
                        >
                            View all
                            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                        </Link>
                    </motion.div>
                </div>

                {/* ── Card grid ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                    {posts.map((post, index) => {
                        const isFeaturedInGrid = highlightFirst && index === 0;
                        return (
                            <div
                                key={post.id}
                                className={isFeaturedInGrid ? 'md:col-span-2 lg:col-span-2' : ''}
                            >
                                <BlogCard post={post} index={index} />
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default BlogList;

