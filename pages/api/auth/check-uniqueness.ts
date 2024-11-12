// pages/api/auth/check-uniqueness.ts
import { NextApiRequest, NextApiResponse } from 'next';
import {prisma} from '@/lib/prisma';
import { authMiddleware } from '@/middleware/authMiddleware';

async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;

    // // check rate limit
    // const rateLimitCheck = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/rate-limit?apiRoute=checkUniqueness`);

    // if (!rateLimitCheck.ok) {
    //     const errorText = await rateLimitCheck.text();
    //     console.error('Rate limit error:', errorText);
    //     res.status(429).json({ error: errorText });
    //     return;
    // }

    if (method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${method} Not Allowed`);
        return 
    }

    const { username, email } = req.body;

    if (!username || !email) {
        res.status(400).json({ error: 'Username and email are required' });
        return 
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
            res.status(400).json({ error: 'Email or username already exists' });
            return 
        }

        res.status(200).json({ message: 'Username and email are unique' });
    } catch (error) {
        console.error('Internal server error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}


export default function securedHandler(req: NextApiRequest, res: NextApiResponse) {
    return authMiddleware(req, res, handler);
}