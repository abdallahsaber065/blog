import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { options as authOptions } from '@/pages/api/auth/[...nextauth]';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const session = await getServerSession(req, res, authOptions);

    if (!session || !session.user || !session.user.id) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const userId = parseInt(session.user.id);

    if (isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
    }

    try {
        const selectQuery = {
            id: true,
            slug: true,
            title: true,
            excerpt: true,
            created_at: true,
            updated_at: true,
            published_at: true,
            featured_image_url: true,
            tags: { select: { name: true, slug: true } },
            category: { select: { name: true, slug: true } },
        };

        // Fetch bookmarked posts
        const bookmarks = await prisma.bookmark.findMany({
            where: { user_id: userId },
            include: {
                post: { select: selectQuery }
            },
            orderBy: { created_at: 'desc' },
        });

        // Fetch liked posts
        const likes = await prisma.like.findMany({
            where: { user_id: userId },
            include: {
                post: { select: selectQuery }
            },
            orderBy: { created_at: 'desc' },
        });

        // Serialize dates for JSON
        const serializePost = (post: any) => ({
            ...post,
            created_at: post.created_at ? post.created_at.toISOString() : null,
            updated_at: post.updated_at ? post.updated_at.toISOString() : null,
            published_at: post.published_at ? post.published_at.toISOString() : null,
        });

        return res.status(200).json({
            bookmarkedPosts: bookmarks.map(b => serializePost(b.post)),
            likedPosts: likes.map(l => serializePost(l.post)),
        });
    } catch (error) {
        console.error('Error fetching user library:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}
