import { NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export const REVALIDATE_PATHS = {
  HOME: '/',
  ALL_TAGS: '/tags/all',
  ALL_CATEGORIES: '/categories/all',
  AUTHORS: '/authors',
  BLOG: '/blogs',
  ABOUT: '/about',
  getAuthorPath: (username: string) => `/authors/${username}`,
  getTagPath: (slug: string) => `/tags/${slug}`,
  getCategoryPath: (slug: string) => `/categories/${slug}`,
  getBlogPath: (slug: string) => `/blogs/${slug}`,
};

export async function revalidateRoutes(res: NextApiResponse, paths: string[]) {
  try {
    console.log('Revalidating paths:', paths);

    // If paths include any Tag-related paths, fetch all Tag slugs
    const shouldRevalidateAllTags = paths.some(path =>
      path === REVALIDATE_PATHS.ALL_TAGS ||
      path.startsWith('/tags/')
    );

    if (shouldRevalidateAllTags) {
      const allTags = await prisma.tag.findMany({
        select: { slug: true }
      });
      paths = [
        ...paths,
        ...allTags.map(tag => REVALIDATE_PATHS.getTagPath(tag.slug))
      ];
    }

    // If paths include any Category-related paths, fetch all Category slugs
    const shouldRevalidateAllCategories = paths.some(path =>
      path === REVALIDATE_PATHS.ALL_CATEGORIES ||
      path.startsWith('/categories/')
    );

    if (shouldRevalidateAllCategories) {
      const allCategories = await prisma.category.findMany({
        select: { slug: true }
      });
      paths = [
        ...paths,
        ...allCategories.map(category => REVALIDATE_PATHS.getCategoryPath(category.slug))
      ];
    }

    // Always revalidate the home page when dealing with posts
    if (paths.some(path => path.startsWith('/blogs/'))) {
      paths.push(REVALIDATE_PATHS.HOME);
    }

    // Remove duplicates
    paths = [...new Set(paths)];

    console.log('Final paths to revalidate:', paths);

    const results = await Promise.allSettled(paths.map(path => res.revalidate(path)));
    const failures = results.filter(result => result.status === 'rejected');

    if (failures.length > 0) {
      console.error('Some paths failed to revalidate:', failures);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error revalidating:', error);
    return false;
  }
}