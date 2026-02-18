'use client';
import Link from "next/link";
import BlogLayoutThree from "../Blog/BlogLayoutThree";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface RecentPostsProps {
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

const RecentPosts = ({ posts }: RecentPostsProps) => {
  return (
    <section className="w-full mt-20 sm:mt-28 md:mt-36 px-4 sm:px-8 md:px-16 sxl:px-24 pb-20 sm:pb-32">
      {/* Section heading */}
      <div className="flex items-center justify-between mb-10 sm:mb-14">
        <div className="flex items-center gap-4">
          <div className="w-1 h-8 rounded-full bg-gold" />
          <h2 className="font-display font-bold text-2xl md:text-4xl text-foreground">
            Recent Posts
          </h2>
        </div>
        <Link
          href="/explore"
          className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-gold hover:text-goldLight transition-colors duration-200 group"
        >
          View all
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {posts.slice(4, 10).map((post, index) => (
          <motion.article
            key={index}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.55, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="col-span-1"
          >
            <BlogLayoutThree post={post} />
          </motion.article>
        ))}
      </div>

      {/* Mobile view-all CTA */}
      <div className="sm:hidden text-center mt-10">
        <Link
          href="/explore"
          className="inline-flex items-center gap-2 bg-gold text-dark font-semibold text-sm px-6 py-3 rounded-xl shadow-gold-sm hover:shadow-gold transition-all duration-200"
        >
          View All Posts
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
};

export default RecentPosts;
