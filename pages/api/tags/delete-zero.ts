import { prisma } from '@/lib/prisma';
import { REVALIDATE_PATHS, revalidateRoutes } from '@/lib/revalidate';
import { authMiddleware } from '@/middleware/authMiddleware';
import { NextApiRequest, NextApiResponse } from 'next';


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
            res.status(500).json({ error: 'Failed to delete tags' });
        }
    } else {
        res.setHeader('Allow', ['DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}


export default function securedHandler(req: NextApiRequest, res: NextApiResponse) {
    return authMiddleware(req, res, handler);
}
