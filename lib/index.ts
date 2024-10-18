import { compareDesc, parseISO } from "date-fns";
import { Post, Tag as PrismaTag } from "@prisma/client";
import GithubSlugger from 'github-slugger';

interface Heading {
  level: 'one' | 'two' | 'three';
  text: string;
  slug: string;
}

// published_at is Date object
export const cx = (...classNames: string[]): string => classNames.filter(Boolean).join(" ");

interface PostWithTags extends Post {
  tags: PrismaTag[];
}

export const sortPosts = (posts: PostWithTags[]): PostWithTags[] => {
  return posts
    .slice()
    .sort((a, b) => {
      const dateA = a.published_at ? parseISO(a.published_at.toISOString()) : new Date(0);
      const dateB = b.published_at ? parseISO(b.published_at.toISOString()) : new Date(0);
      return compareDesc(dateA, dateB);
    });
};

export function generateTOC(content: string) {
  const regex = /\n(#{1,6})\s+(.+)/g;
  const slugger = new GithubSlugger();
  const headings = Array.from(content.matchAll(regex)).map((match) => {
    const [ , flag, text ] = match;

    return {
      level: flag.length === 1 ? 'one' : flag.length === 2 ? 'two' : 'three',
      text: text || '',
      slug: text ? slugger.slug(text) : '',
    };
  });

  return headings;
}