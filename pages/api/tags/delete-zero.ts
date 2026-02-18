import { prisma } from '@/lib/prisma';
import { REVALIDATE_PATHS, revalidateRoutes } from '@/lib/revalidate';
import { authMiddleware } from '@/middleware/authMiddleware';
import { NextApiRequest, NextApiResponse } from 'next';
import { apiError, methodNotAllowed } from '@/lib/apiError';


async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'DELETE') {
        try {
            await prisma.tag.deleteMany({
                where: {
                    posts: {
                        none: {},
                    },
                },
            });
            const routesToRevalidate = [

                REVALIDATE_PATHS.EXPLORE
            ];
            await revalidateRoutes(res, routesToRevalidate);
            res.status(200).json({ message: 'Tags with 0 posts deleted successfully' });
        } catch (error) {
            console.error('delete-zero tags error:', error);
            return apiError(res, 500, 'Failed to delete tags');
        }
    } else {
        return methodNotAllowed(res, ['DELETE']);
    }
}


export default function securedHandler(req: NextApiRequest, res: NextApiResponse) {
    return authMiddleware(req, res, handler);
}
