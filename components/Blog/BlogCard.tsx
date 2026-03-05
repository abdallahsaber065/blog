import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, ArrowRight } from 'lucide-react';
import { resolvePublicUrl } from '@/lib/storage';

export interface Post {
    id: string;
    slug: string;
    title: string;
    excerpt: string | null;
    published_at: Date | null;
    featured_image_url: string | null;
    category: { name: string; slug: string } | null;
    tags?: { name: string; slug: string }[];
}

interface BlogCardProps {
    post: Post;
    index: number;
}

const BlogCard: React.FC<BlogCardProps> = ({ post, index }) => {
    const formattedDate = post.published_at
        ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(post.published_at))
        : '';

    return (
        <motion.article
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: Math.min(index * 0.1, 0.4), ease: [0.16, 1, 0.3, 1] }}
            className="group relative flex flex-col h-[450px] bg-darkElevated rounded-2xl overflow-hidden border border-darkBorder transition-all hover:border-gold/30 hover:shadow-card-dark"
        >
            {/* Full-card link overlay */}
            <Link href={`/blog/${post.slug}`} className="absolute inset-0 z-20" aria-label={post.title} />

            <div className="relative aspect-[16/10] overflow-hidden bg-dark">
                <motion.img
                    src={post.featured_image_url ? resolvePublicUrl(post.featured_image_url) : 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=2072&auto=format&fit=crop'}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-105"
                />
                {/* Subtle overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-darkElevated to-transparent opacity-80"></div>

                {post.category && (
                    <div className="absolute top-4 left-4 z-20">
                        <span className="inline-block py-1 px-3 rounded-full bg-dark/80 backdrop-blur-md text-gold text-xs font-semibold tracking-wide border border-gold/20">
                            {post.category.name}
                        </span>
                    </div>
                )}
            </div>

            <div className="flex flex-col flex-grow p-6 relative z-10">
                <div className="flex items-center text-light/50 text-xs font-medium mb-3">
                    <Calendar className="w-3.5 h-3.5 mr-1.5" />
                    <time>{formattedDate}</time>
                </div>

                <h3 className="text-xl font-bold font-display text-light mb-3 line-clamp-2 group-hover:text-gold transition-colors duration-300">
                    {post.title}
                </h3>

                <p className="text-light/70 text-sm line-clamp-3 mb-6 flex-grow font-inter leading-relaxed">
                    {post.excerpt}
                </p>

                <div className="pt-4 border-t border-darkBorder flex items-center justify-between mt-auto">
                    <span className="text-sm font-semibold text-gold flex items-center gap-1 transition-transform group-hover:translate-x-1 duration-300">
                        Read more <ArrowRight className="w-4 h-4 ml-1" />
                    </span>
                </div>
            </div>
        </motion.article>
    );
};

export default BlogCard;
