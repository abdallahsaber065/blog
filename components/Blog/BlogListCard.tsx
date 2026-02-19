import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Calendar, Clock, Eye, Folder, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

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
  // Get author display name
  const getAuthorName = () => {
    if (!post.author) return 'Unknown Author';
    if (post.author.first_name || post.author.last_name) {
      return `${post.author.first_name || ''} ${post.author.last_name || ''}`.trim();
    }
    return post.author.username;
  };

  return (
    <Link href={`/blogs/${post.slug}`}>
      <article className="group flex flex-col sm:flex-row gap-4 sm:gap-6 p-4 sm:p-5 bg-card rounded-2xl border border-lightBorder dark:border-darkBorder hover:border-gold/40 hover:shadow-elevated transition-all duration-300 hover:-translate-y-1">
        {/* Image and Author Info Container */}
        <div className="flex flex-col gap-2 sm:w-32 md:w-40 flex-shrink-0">
          <div className="relative w-full h-48 sm:h-32 rounded-xl overflow-hidden bg-lightElevated dark:bg-darkElevated">
            <Image
              src={post.featured_image_url}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, 160px"
            />
          </div>

          {/* Author and Date under image */}
          <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              <span className="font-medium">{getAuthorName()}</span>
            </div>
            {post.published_at && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{format(new Date(post.published_at), 'MMM dd, yyyy')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-between min-w-0">
          {/* Title & Excerpt */}
          <div>
            <h2 className="text-xl md:text-2xl font-display font-bold text-foreground mb-2 line-clamp-2 group-hover:text-gold transition-colors duration-200">
              {post.title}
            </h2>

            {post.excerpt && (
              <p className="text-muted-foreground text-sm md:text-base line-clamp-2 md:line-clamp-3 mb-3">
                {post.excerpt}
              </p>
            )}
          </div>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-3 md:gap-4 text-xs md:text-sm text-muted-foreground">
            {post.category && (
              <div className="flex items-center gap-1">
                <Folder className="w-3.5 h-3.5 md:w-4 md:h-4" />
                <span>{post.category.name}</span>
              </div>
            )}

            {post.reading_time && (
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 md:w-4 md:h-4" />
                <span>{post.reading_time} min read</span>
              </div>
            )}

            {post.views !== undefined && (
              <div className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 md:w-4 md:h-4" />
                <span>{post.views} views</span>
              </div>
            )}
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {post.tags.slice(0, 3).map((tag) => (
                <Badge
                  key={tag.slug}
                  variant="outline"
                  className="text-xs bg-gold/10 dark:bg-gold/10 border-gold/30 dark:border-gold/30 text-gold dark:text-goldLight hover:bg-gold/20 dark:hover:bg-gold/20 transition-all duration-200">

                  #{tag.name}
                </Badge>
              ))}
              {post.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{post.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>
      </article>
    </Link>
  );
};

export default BlogListCard;
