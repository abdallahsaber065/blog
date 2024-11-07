import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { authMiddleware } from '@/middleware/authMiddleware';

async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'DELETE') {
        try {
            await prisma.category.deleteMany({
                where: {
                    posts: {
                        none: {},
                    },
                },
            });
            res.status(200).json({ message: 'Categories with 0 posts deleted successfully' });
        } catch (error) {
            res.status(500).json({ error: 'Failed to delete categories' });
        }
    } else {
        res.setHeader('Allow', ['DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}


export default function securedHandler(req: NextApiRequest, res: NextApiResponse) {
    return authMiddleware(req, res, handler);
}