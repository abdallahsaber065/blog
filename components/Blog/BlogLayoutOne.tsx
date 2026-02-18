import React from "react";
import Tag from "../Elements/Tag";
import Link from "next/link";
import Image from "next/image";
import { slug } from "github-slugger";

interface BlogLayoutOneProps {
  post: {
    slug: string;
    title: string;
    excerpt: string;
    created_at: string;
    updated_at: string;
    published_at: string | null;
    featured_image_url: string;
    tags: { slug: string; name: string }[];
    category: { slug: string; name: string } | null;
  };
}

const BlogLayoutOne = ({ post }: BlogLayoutOneProps) => {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-lightBorder dark:border-darkBorder h-full min-h-[320px] shadow-card dark:shadow-card-dark hover:shadow-elevated transition-all duration-300 hover:border-gold/30">
      {/* Gradient overlay */}
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-dark/95 via-dark/40 to-transparent rounded-2xl" />

      {/* Image with zoom */}
      <Image
        src={post.featured_image_url || "/static/images/default-image.webp"}
        placeholder="blur"
        blurDataURL={post.featured_image_url || "/static/images/default-image.webp"}
        alt={post.title}
        fill
        className="object-cover object-center z-0 group-hover:scale-105 transition-transform duration-700 ease-out"
        sizes="(max-width: 1180px) 100vw, 50vw"
      />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-4 xs:p-6 sm:p-8 z-20">
        {post.category && (
          <Tag
            link={`/categories/${slug(post.category?.name)}`}
            name={post.category?.name || ''}
            className="text-xs"
          />
        )}
        <Link href={`/blogs/${post.slug}`} className="mt-4 block">
          <h2 className="font-display font-bold capitalize text-sm xs:text-base sm:text-xl md:text-2xl text-light mt-3 leading-snug">
            <span className="bg-gradient-to-r from-gold/70 to-gold/70 bg-[length:0px_2px] group-hover:bg-[length:100%_2px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500">
              {post.title}
            </span>
          </h2>
        </Link>
      </div>
    </div>
  );
};

export default BlogLayoutOne;