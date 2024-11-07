// pages/api/auth/verify-email.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { authMiddleware } from '@/middleware/authMiddleware';

async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    const { method } = req;

    if (method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${method} Not Allowed`);
        return;
    }

    const { token } = req.query;

    if (!token || typeof token !== 'string') {
        res.status(400).json({ error: 'Invalid or missing token' });
        return;
    }

    try {
        const user = await prisma.user.findFirst({
            where: { verification_token: token },
        });

        if (!user) {
            res.status(400).json({ error: 'Invalid token' });
            return;
        }

        await prisma.user.update({
            where: { id: user.id },
            data: {
                email_verified: true,
                verification_token: null,
            },
        });

        res.status(200).json({ message: 'Email verified successfully' });
    } catch (error) {
        console.error('Internal server error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export default function securedHandler(req: NextApiRequest, res: NextApiResponse) {
    return authMiddleware(req, res, handler);
}