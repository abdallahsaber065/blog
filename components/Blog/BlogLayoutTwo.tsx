import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { resolvePublicUrl } from "@/lib/storage";

interface BlogLayoutTwoProps {
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

const BlogLayoutTwo = ({ post }: BlogLayoutTwoProps) => {
  return (
    <div className="group grid grid-cols-12 gap-0 items-stretch overflow-hidden rounded-2xl border border-lightBorder dark:border-darkBorder shadow-card dark:shadow-card-dark hover:shadow-elevated hover:border-gold/30 transition-all duration-300 card-tilt">
      {/* Thumbnail */}
      <Link
        href={`/blogs/${post.slug}`}
        className="col-span-12 lg:col-span-5 overflow-hidden block"
      >
        <Image
          src={post.featured_image_url ? resolvePublicUrl(post.featured_image_url) : "/static/images/default-image.webp"}
          placeholder="blur"
          blurDataURL={post.featured_image_url ? resolvePublicUrl(post.featured_image_url) : "/static/images/default-image.webp"}
          alt={post.title}
          width={400}
          height={300}
          className="aspect-video lg:aspect-square w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
          sizes="(max-width: 640px) 100vw,(max-width: 1024px) 50vw, 33vw"
        />
      </Link>

      {/* Text content */}
      <div className="col-span-12 lg:col-span-7 p-5 lg:p-6 flex flex-col justify-center bg-card">
        {post.category && (
          <span className="inline-block mb-2.5 text-xs font-semibold uppercase tracking-wider text-gold">
            {post.category.name}
          </span>
        )}
        <Link href={`/blogs/${post.slug}`} className="block">
          <h2 className="font-display font-semibold capitalize text-base sm:text-lg leading-snug text-foreground">
            <span className="bg-gradient-to-r from-gold/60 to-gold/60 bg-[length:0px_2px] group-hover:bg-[length:100%_2px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500">
              {post.title}
            </span>
          </h2>
        </Link>
        <span className="mt-3 text-xs text-muted-foreground font-medium">
          {post.published_at ? format(new Date(post.published_at), "MMM dd, yyyy") : "Unpublished"}
        </span>
      </div>
    </div>
  );
};

export default BlogLayoutTwo;