'use client';
import React from "react";
import BlogLayoutOne from "../Blog/BlogLayoutOne";
import BlogLayoutTwo from "../Blog/BlogLayoutTwo";
import { motion } from "framer-motion";

interface FeaturedPostsProps {
  posts: {
    slug: string;
    title: string;
    excerpt: string;
    created_at: string;
    updated_at: string;
    published_at: string | null;
    featured_image_url: string;
    tags: { slug: string; name: string }[];
    category: { slug: string; name: string } | null;
  }[];
}

const FeaturedPosts = ({ posts }: FeaturedPostsProps) => {
  return (
    <section className="w-full mt-20 sm:mt-28 md:mt-36 px-4 sm:px-8 md:px-16 sxl:px-24">
      {/* Section heading */}
      <div className="flex items-center gap-4 mb-10 sm:mb-14">
        <div className="w-1 h-8 rounded-full bg-gold" />
        <h2 className="font-display font-bold text-2xl md:text-4xl text-foreground">
          Featured Posts
        </h2>
      </div>

      <div className="grid grid-cols-2 grid-rows-2 gap-5 sm:gap-6">
        <motion.article
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="col-span-2 sxl:col-span-1 row-span-2 relative"
        >
          <BlogLayoutOne post={posts[1]} />
        </motion.article>
        <motion.article
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="col-span-2 sm:col-span-1 row-span-1 relative"
        >
          <BlogLayoutTwo post={posts[2]} />
        </motion.article>
        <motion.article
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="col-span-2 sm:col-span-1 row-span-1 relative"
        >
          <BlogLayoutTwo post={posts[3]} />
        </motion.article>
      </div>
    </section>
  );
};

export default FeaturedPosts;