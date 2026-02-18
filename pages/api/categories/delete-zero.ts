import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { authMiddleware } from '@/middleware/authMiddleware';
import { REVALIDATE_PATHS } from '@/lib/revalidate';
import { revalidateRoutes } from '@/lib/revalidate';
import { apiError, methodNotAllowed } from '@/lib/apiError';

async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'DELETE') {
        try {
            await prisma.category.deleteMany({
                where: {
                    posts: {
                        none: {},
                    },
                    slug: {
                        not: 'uncategorized',
                    },
                },
            });
            const routesToRevalidate = [
                REVALIDATE_PATHS.EXPLORE
            ];
            await revalidateRoutes(res, routesToRevalidate);
            res.status(200).json({ message: 'Categories with 0 posts deleted successfully' });
        } catch (error) {
            console.error('delete-zero categories error:', error);
            return apiError(res, 500, 'Failed to delete categories');
        }
    } else {
        return methodNotAllowed(res, ['DELETE']);
    }
}


export default function securedHandler(req: NextApiRequest, res: NextApiResponse) {
    return authMiddleware(req, res, handler);
}