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

        const existingBookmark = await prisma.bookmark.findUnique({
            where: {
                user_id_post_id: {
                    user_id: userId,
                    post_id: post.id,
                },
            },
        });

        if (existingBookmark) {
            await prisma.bookmark.delete({
                where: { id: existingBookmark.id },
            });
            return res.status(200).json({ action: 'removed' });
        } else {
            await prisma.bookmark.create({
                data: {
                    user_id: userId,
                    post_id: post.id,
                },
            });
            return res.status(200).json({ action: 'added' });
        }
    } catch (error) {
        console.error('Error toggling bookmark:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
