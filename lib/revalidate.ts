import { NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export const REVALIDATE_PATHS = {
  HOME: '/',
  CATEGORIES: '/categories',
  CATEGORIES_ALL: '/categories/all',
  AUTHORS: '/authors',
  BLOG: '/blogs',
  getAuthorPath: (username: string) => `/authors/${username}`,
  getCategoryPath: (slug: string) => `/categories/${slug}`,
  getBlogPath: (slug: string) => `/blogs/${slug}`,
};

export async function revalidateRoutes(res: NextApiResponse, paths: string[]) {
  try {
    console.log('Revalidating paths:', paths);

    // If paths include any category-related paths, fetch all category slugs
    const shouldRevalidateAllCategories = paths.some(path =>
      path === REVALIDATE_PATHS.CATEGORIES ||
      path === REVALIDATE_PATHS.CATEGORIES_ALL ||
      path.startsWith('/categories/')
    );

    if (shouldRevalidateAllCategories) {
      const allTags = await prisma.tag.findMany({
        select: { slug: true }
      });
      paths = [
        ...paths,
        ...allTags.map(tag => REVALIDATE_PATHS.getCategoryPath(tag.slug))
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