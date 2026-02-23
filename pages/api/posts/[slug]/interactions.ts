import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { options as authOptions } from '@/pages/api/auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { slug } = req.query;

    if (!slug || typeof slug !== 'string') {
        return res.status(400).json({ message: 'Invalid or missing slug' });
    }

    try {
        const post = await prisma.post.findUnique({
            where: { slug },
            select: {
                id: true,
                views: true,
                _count: {
                    select: { likes: true }
                }
            },
        });

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        let hasLiked = false;
        let hasBookmarked = false;

        const session = await getServerSession(req, res, authOptions);
        if (session && session.user) {
            const userId = parseInt(session.user.id as string, 10);

            const [like, bookmark] = await Promise.all([
                prisma.like.findUnique({
                    where: {
                        user_id_post_id: { user_id: userId, post_id: post.id }
                    }
                }),
                prisma.bookmark.findUnique({
                    where: {
                        user_id_post_id: { user_id: userId, post_id: post.id }
                    }
                })
            ]);

            hasLiked = !!like;
            hasBookmarked = !!bookmark;
        }

        return res.status(200).json({
            views: post.views,
            likesCount: post._count.likes,
            hasLiked,
            hasBookmarked,
        });
    } catch (error) {
        console.error('Error fetching interactions:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
