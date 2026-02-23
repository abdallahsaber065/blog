import React from 'react';
import { motion } from 'framer-motion';
import ModernBlogCard, { ModernPost } from '../Blog/ModernBlogCard';

interface ModernBlogListProps {
    title: string;
    description?: string;
    posts: ModernPost[];
    highlightFirst?: boolean;
}

const ModernBlogList: React.FC<ModernBlogListProps> = ({ title, description, posts, highlightFirst = false }) => {
    if (!posts || posts.length === 0) return null;

    return (
        <section className="py-10 md:py-16 bg-dark">
            <div className="container px-4 md:px-8">
                <div className="max-w-3xl mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        className="text-3xl md:text-5xl font-bold font-display text-light mb-4"
                    >
                        {title}
                    </motion.h2>
                    {description && (
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                            className="text-lg text-light/60 font-inter"
                        >
                            {description}
                        </motion.p>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                    {posts.map((post, index) => {
                        // Optional: making the first item span more columns if highlightFirst is true
                        const isFeaturedInGrid = highlightFirst && index === 0;
                        return (
                            <div
                                key={post.id}
                                className={isFeaturedInGrid ? 'md:col-span-2 lg:col-span-2' : ''}
                            >
                                <ModernBlogCard post={post} index={index} />
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default ModernBlogList;
