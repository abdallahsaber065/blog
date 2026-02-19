import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import React from "react";

interface BlogLayoutThreeProps {
  post: {
    slug: string;
    title: string;
    created_at: string;
    updated_at: string;
    published_at: string | null;
    featured_image_url: string;
    tags: { slug: string; name: string }[];
  };
}

const BlogLayoutThree = ({ post }: BlogLayoutThreeProps) => {
  return (
    <div className="group flex flex-col items-start overflow-hidden rounded-2xl border border-lightBorder dark:border-darkBorder shadow-card dark:shadow-card-dark hover:shadow-elevated hover:border-gold/30 transition-all duration-300 bg-card card-tilt">
      {/* Image */}
      <Link href={`/blogs/${post.slug}`} className="w-full overflow-hidden block">
        <Image
          src={post.featured_image_url || "/static/images/default-image.webp"}
          placeholder="blur"
          blurDataURL={post.featured_image_url || "/static/images/default-image.webp"}
          alt={post.title}
          width={800}
          height={600}
          className="aspect-[16/10] w-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
          sizes="(max-width: 640px) 100vw,(max-width: 1024px) 50vw, 33vw"
        />
      </Link>

      {/* Content */}
      <div className="flex flex-col w-full p-5">
        {post.tags.length > 0 && (
          <span className="inline-block mb-2 text-xs font-semibold uppercase tracking-wider text-gold">
            {post.tags[0].name}
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

export default BlogLayoutThree;