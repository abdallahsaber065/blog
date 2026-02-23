import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Calendar, Clock, Eye, Folder, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { resolvePublicUrl, isCloudProvider, isExternalUrl } from '@/lib/storage';

interface Post {
  slug: string;
  title: string;
  excerpt?: string;
  created_at: string;
  published_at: string | null;
  featured_image_url: string;
  reading_time?: number;
  views?: number;
  category?: { slug: string; name: string };
  author?: { first_name: string | null; last_name: string | null; username: string };
  tags: { slug: string; name: string }[];
}

interface BlogListCardProps {
  post: Post;
}

const BlogListCard: React.FC<BlogListCardProps> = ({ post }) => {
  const getAuthorName = () => {
    if (!post.author) return 'Unknown Author';
    if (post.author.first_name || post.author.last_name) {
      return `${post.author.first_name || ''} ${post.author.last_name || ''}`.trim();
    }
    return post.author.username;
  };

  const imageUrl = post.featured_image_url
    ? resolvePublicUrl(post.featured_image_url)
    : '/static/images/default-image.webp';

  return (
    <Link href={`/blog/${post.slug}`} className="block group">
      <article className="
        relative flex flex-col sm:flex-row gap-0 sm:gap-5
        bg-card rounded-2xl border border-lightBorder dark:border-darkBorder
        hover:border-gold/50 dark:hover:border-gold/40
        overflow-hidden
        transition-all duration-300
        hover:shadow-elevated hover:shadow-gold/5
        hover:-translate-y-1
      ">
        {/* Gold accent bar on left (desktop) */}
        <div className="hidden sm:block absolute left-0 top-4 bottom-4 w-0.5 bg-gradient-to-b from-transparent via-gold/0 to-transparent group-hover:via-gold/40 transition-all duration-500 rounded-full" />

        {/* Image */}
        <div className="relative w-full sm:w-36 md:w-44 flex-shrink-0">
          <div className="relative w-full h-44 sm:h-full min-h-[9rem] overflow-hidden sm:rounded-l-2xl sm:rounded-r-none rounded-t-2xl">
            <Image
              src={imageUrl}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, 176px"
              unoptimized={isCloudProvider() || (post.featured_image_url ? isExternalUrl(imageUrl) : false)}
            />
            {/* Subtle overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-dark/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Category pill on image */}
            {post.category && (
              <div className="absolute bottom-2 left-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-dark/60 backdrop-blur-sm text-[10px] font-semibold text-gold border border-gold/30 shadow-sm">
                  <Folder className="w-2.5 h-2.5" />
                  {post.category.name}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-between min-w-0 p-4 sm:p-5 sm:pl-4">
          {/* Author + Date — mobile */}
          <div className="flex items-center gap-3 mb-2.5 sm:mb-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <div className="w-5 h-5 rounded-full bg-gold/15 flex items-center justify-center flex-shrink-0">
                <User className="w-3 h-3 text-gold" />
              </div>
              <span className="font-medium truncate max-w-[120px]">{getAuthorName()}</span>
            </div>
            {post.published_at && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground/70">
                <Calendar className="w-3 h-3" />
                <span>{format(new Date(post.published_at), 'MMM dd, yyyy')}</span>
              </div>
            )}
          </div>

          {/* Title */}
          <h2 className="text-base sm:text-lg md:text-xl font-display font-bold text-foreground mb-1.5 line-clamp-2 group-hover:text-gold transition-colors duration-200 leading-snug">
            {post.title}
          </h2>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-muted-foreground text-xs sm:text-sm line-clamp-2 mb-3 leading-relaxed">
              {post.excerpt}
            </p>
          )}

          {/* Bottom row: meta + tags */}
          <div className="flex flex-wrap items-center justify-between gap-2 mt-auto pt-2 border-t border-lightBorder/50 dark:border-darkBorder/50">
            {/* Stats */}
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {post.reading_time && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {post.reading_time} min
                </span>
              )}
              {post.views !== undefined && (
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {post.views.toLocaleString()}
                </span>
              )}
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {post.tags.slice(0, 2).map((tag) => (
                  <Badge
                    key={tag.slug}
                    variant="outline"
                    className="text-[10px] px-2 py-0.5 bg-gold/8 dark:bg-gold/10 border-gold/25 dark:border-gold/30 text-gold dark:text-goldLight hover:bg-gold/20 dark:hover:bg-gold/20 transition-all duration-200"
                  >
                    #{tag.name}
                  </Badge>
                ))}
                {post.tags.length > 2 && (
                  <Badge variant="outline" className="text-[10px] px-2 py-0.5 text-muted-foreground border-lightBorder dark:border-darkBorder">
                    +{post.tags.length - 2}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
};

export default BlogListCard;
