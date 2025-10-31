import { prisma } from '@/lib/prisma';
import { NextApiResponse } from 'next';

export const REVALIDATE_PATHS = {
  HOME: '/',
  EXPLORE: '/explore',
  AUTHORS: '/authors',
  BLOG: '/blogs',
  ABOUT: '/about',
  getAuthorPath: (username: string) => `/authors/${username}`,
  getExploreTagPath: (slug: string) => `/explore?tag=${slug}`,
  getExploreCategoryPath: (slug: string) => `/explore?category=${slug}`,
  getBlogPath: (slug: string) => `/blogs/${slug}`,
};

export async function revalidateRoutes(res: NextApiResponse, paths: string[]) {
  try {
    console.log('Revalidating paths:', paths);

    // If paths include any Tag-related paths, fetch all Tag slugs and revalidate explore page
    const shouldRevalidateAllTags = paths.some(path =>
      path === REVALIDATE_PATHS.EXPLORE ||
      path.includes('tag=')
    );

    if (shouldRevalidateAllTags) {
      const allTags = await prisma.tag.findMany({
        select: { slug: true }
      });
      paths = [
        ...paths,
        REVALIDATE_PATHS.EXPLORE,
        ...allTags.map(tag => REVALIDATE_PATHS.getExploreTagPath(tag.slug))
      ];
    }

    // If paths include any Category-related paths, fetch all Category slugs and revalidate explore page
    const shouldRevalidateAllCategories = paths.some(path =>
      path === REVALIDATE_PATHS.EXPLORE ||
      path.includes('category=')
    );

    if (shouldRevalidateAllCategories) {
      const allCategories = await prisma.category.findMany({
        select: { slug: true }
      });
      paths = [
        ...paths,
        REVALIDATE_PATHS.EXPLORE,
        ...allCategories.map(category => REVALIDATE_PATHS.getExploreCategoryPath(category.slug))
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