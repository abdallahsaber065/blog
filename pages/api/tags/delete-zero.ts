import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { authMiddleware } from '@/middleware/authMiddleware';

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