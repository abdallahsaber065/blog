import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Post, Tag as PrismaTag } from "@prisma/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
    <Card className="group grid grid-cols-12 gap-4 items-center border-none shadow-md hover:shadow-lg transition-shadow overflow-hidden">
      <Link
        href={`/blogs/${post.slug}`}
        className="col-span-12 lg:col-span-4 h-full overflow-hidden"
      >
        <Image
          src={post.featured_image_url || "/static/images/default-image.jpg"}
          placeholder="blur"
          blurDataURL={post.featured_image_url || "/static/images/default-image.jpg"}
          alt={post.title}
          width={800}
          height={600}
          className="aspect-square w-full h-full object-cover object-center group-hover:scale-105 transition-all ease duration-300"
          sizes="(max-width: 640px) 100vw,(max-width: 1024px) 50vw, 33vw"
        />
      </Link>

      <CardContent className="col-span-12 lg:col-span-8 w-full p-4 lg:p-6">
        {post.category && (
          <Badge variant="secondary" className="mb-2">
            {post.category.name.toUpperCase()}
          </Badge>
        )}
        <Link href={`/blogs/${post.slug}`} className="inline-block my-1">
          <h2 className="font-semibold capitalize text-base sm:text-lg text-dark dark:text-light">
            <span
              className="bg-gradient-to-r from-accent/50 dark:from-accentDark/50 to-accent/50 dark:to-accentDark/50 bg-[length:0px_6px]
                group-hover:bg-[length:100%_6px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 "
            >
              {post.title}
            </span>
          </h2>
        </Link>

        <span className="inline-block w-full capitalize text-gray dark:text-light/50 font-semibold text-xs sm:text-base">
          {post.published_at ? format(new Date(post.published_at), "MMMM dd, yyyy") : "Unpublished"}
        </span>
      </CardContent>
    </Card>
  );
};

export default BlogLayoutTwo;