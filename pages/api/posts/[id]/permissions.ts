import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { authMiddleware } from '@/middleware/authMiddleware';

async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method, query } = req;
    const postId = Number(query.id);

    if (method !== 'PUT') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { users, roles } = req.body;

        // Delete existing permissions
        await prisma.postPermission.deleteMany({
            where: { post_id: postId }
        });

        // Create new permissions
        const permissions = await prisma.$transaction([
            // Add user-specific permissions
            ...users.map((userId: number) =>
                prisma.postPermission.create({
                    data: {
                        post_id: postId,
                        user_id: userId
                    }
                })
            ),
            // Add role-based permissions
            ...roles.map((role: string) =>
                prisma.postPermission.create({
                    data: {
                        post_id: postId,
                        role: role
                    }
                })
            )
        ]);

        res.status(200).json(permissions);
    } catch (error) {
        console.error('Permission update error:', error);
        res.status(500).json({ error: 'Failed to update permissions' });
    }
}

export default function securedHandler(req: NextApiRequest, res: NextApiResponse) {
    return authMiddleware(req, res, handler);
}