import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import requestIp from 'request-ip';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { slug } = req.query;

    if (!slug || typeof slug !== 'string') {
        return res.status(400).json({ message: 'Invalid or missing slug' });
    }

    try {
        const post = await prisma.post.findUnique({
            where: { slug },
            select: { id: true },
        });

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const viewerIp = requestIp.getClientIp(req) || 'unknown';

        // To prevent abuse, optionally check if IP already viewed recently
        // Here we'll just insert a view and increment the counter
        await prisma.$transaction([
            prisma.postView.create({
                data: {
                    post_id: post.id,
                    viewer_ip: viewerIp,
                },
            }),
            prisma.post.update({
                where: { id: post.id },
                data: { views: { increment: 1 } },
            }),
        ]);

        return res.status(200).json({ message: 'View recorded successfully' });
    } catch (error) {
        console.error('Error recording view:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
