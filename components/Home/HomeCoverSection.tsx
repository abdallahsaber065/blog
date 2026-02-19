import Image from 'next/image';
import Link from 'next/link';
import React, { useRef } from 'react';
import Tag from '../Elements/Tag';
import { slug } from 'github-slugger';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight } from 'lucide-react';


interface HomeCoverSectionProps {
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

const HomeCoverSection = ({ posts }: HomeCoverSectionProps) => {
  const post = posts[0];
  const containerRef = useRef<HTMLDivElement>(null);

  // Parallax scroll effect
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.5], [0.2, 0.8]);

  // Word-by-word stagger for title
  const titleWords = post.title.split(" ");

  return (
    <div className='w-full inline-block' ref={containerRef}>
      <article className='flex flex-col items-start justify-end mx-4 sm:mx-8 lg:mx-10 relative h-[65vh] sm:h-[88vh] rounded-3xl overflow-hidden'>
        {/* Multi-layer gradients for cinematic depth */}
        <div className='absolute inset-0 z-10 bg-gradient-to-b from-transparent via-dark/20 to-dark/95' />
        <div className='absolute inset-0 z-10 bg-gradient-to-r from-dark/55 via-transparent to-transparent' />

        {/* Parallax image */}
        <motion.div className="absolute inset-0 z-0" style={{ y: imageY }}>
          <Image
            src={post.featured_image_url || '/static/images/default-image.webp'}
            placeholder="blur"
            blurDataURL={post.featured_image_url || '/static/images/default-image.webp'}
            alt={post.title}
            fill
            className='w-full h-full object-center object-cover scale-110'
            sizes='100vw'
            priority
          />
        </motion.div>

        {/* Gold glow accent behind content */}
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gold/[0.06] rounded-full blur-[100px] pointer-events-none z-10" />

        <div className='relative w-full lg:w-3/4 xl:w-2/3 p-6 sm:p-10 md:p-14 lg:p-16 z-20 text-light'>
          {post.category && (
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Tag
                link={`/categories/${slug(post.category.name)}`}
                name={post.category.name}
              />
            </motion.div>
          )}

          <Link href={`/blogs/${post.slug}`} className='mt-5 block group'>
            <h1 className='font-display font-bold capitalize text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl leading-tight'>
              <span className='bg-gradient-to-r from-gold/80 to-gold/80 bg-[length:0px_3px] group-hover:bg-[length:100%_3px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500'>
                {titleWords.map((word, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{
                      duration: 0.5,
                      delay: 0.2 + i * 0.06,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="inline-block"
                  >
                    {word}&nbsp;
                  </motion.span>
                ))}
              </span>
            </h1>
          </Link>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 + titleWords.length * 0.04, ease: [0.16, 1, 0.3, 1] }}
            className='hidden sm:block mt-4 text-base md:text-lg text-light/75 leading-relaxed max-w-xl'
          >
            {post.excerpt}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 + titleWords.length * 0.04 }}
            className='mt-6 sm:mt-8'
          >
            <Link
              href={`/blogs/${post.slug}`}
              className='inline-flex items-center gap-2.5 bg-gold text-dark font-semibold text-sm px-6 py-3 rounded-xl shadow-gold-sm hover:shadow-gold hover:bg-goldLight transition-all duration-200 group/btn'
            >
              Read Article
              <ArrowRight className='w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-200' />
            </Link>
          </motion.div>
        </div>
      </article>
    </div>
  );
};

export default HomeCoverSection;
