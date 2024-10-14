// pages/api/auth/verify-email.ts
import { NextApiRequest, NextApiResponse } from 'next';
import {prisma} from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;

    if (method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }

    const { token } = req.query;

    if (!token || typeof token !== 'string') {
        return res.status(400).json({ error: 'Invalid or missing token' });
    }

    try {
        const user = await prisma.user.findFirst({
            where: { verification_token: token },
        });

        if (!user) {
            return res.status(400).json({ error: 'Invalid token' });
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