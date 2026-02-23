import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { options as authOptions } from '@/pages/api/auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { slug } = req.query;

    if (!slug || typeof slug !== 'string') {
        return res.status(400).json({ message: 'Invalid or missing slug' });
    }

    try {
        const session = await getServerSession(req, res, authOptions);
        if (!session || !session.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const userId = parseInt(session.user.id, 10);

        const post = await prisma.post.findUnique({
            where: { slug },
            select: { id: true },
        });

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check if like exists
        const existingLike = await prisma.like.findUnique({
            where: {
                user_id_post_id: {
                    user_id: userId,
                    post_id: post.id,
                },
            },
        });

        if (existingLike) {
            // Unlike
            await prisma.like.delete({
                where: { id: existingLike.id },
            });
            return res.status(200).json({ action: 'unliked' });
        } else {
            // Like
            await prisma.like.create({
                data: {
                    user_id: userId,
                    post_id: post.id,
                },
            });
            return res.status(200).json({ action: 'liked' });
        }
    } catch (error) {
        console.error('Error toggling like:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
