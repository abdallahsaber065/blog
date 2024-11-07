// pages/api/search.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { authMiddleware } from '@/middleware/authMiddleware';

async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { query } = req;
    const searchQuery = query.query as string;

    if (!searchQuery) {
        return res.status(400).json({ error: "Query parameter is required" });
    }

    try {
        const results = await prisma.post.findMany({
            where: {
                OR: [
                    { title: { contains: searchQuery, mode: 'insensitive' } },
                    { content: { contains: searchQuery, mode: 'insensitive' } },
                ],
            },
            select: {
                id: true,
                title: true,
                slug: true,
                excerpt: true,
                featured_image_url: true,
            },
        });
        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
}

export default function securedHandler(req: NextApiRequest, res: NextApiResponse) {
    return authMiddleware(req, res, handler);
}