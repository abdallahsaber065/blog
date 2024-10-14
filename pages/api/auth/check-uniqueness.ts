// pages/api/auth/check-uniqueness.ts
import { NextApiRequest, NextApiResponse } from 'next';
import {prisma} from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;

    if (method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }

    const { username, email } = req.body;

    if (!username || !email) {
        return res.status(400).json({ error: 'Username and email are required' });
    }

    try {
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    { username }
                ]
            }
        });

        if (existingUser) {
            return res.status(400).json({ error: 'Email or username already exists' });
        }

        res.status(200).json({ message: 'Username and email are unique' });
    } catch (error) {
        console.error('Internal server error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}