import { NextApiResponse } from 'next';

export const REVALIDATE_PATHS = {
  HOME: '/',
  CATEGORIES: '/categories',
  CATEGORIES_ALL: '/categories/all',
  AUTHORS: '/authors',
  getAuthorPath: (username: string) => `/authors/${username}`,
  getCategoryPath: (slug: string) => `/categories/${slug}`,
};

export async function revalidateRoutes(res: NextApiResponse, paths: string[]) {
  try {
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