// pages/api/auth/user.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import {prisma} from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getSession({ req });

    if (!session || !session.user?.email) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error('Internal server error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}