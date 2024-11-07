// pages/api/auth/logout.ts
import { authMiddleware } from '@/middleware/authMiddleware';
import { NextApiRequest, NextApiResponse } from 'next';
import { getSession, signOut } from 'next-auth/react';

async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getSession({ req });

    if (session) {
        await signOut({ redirect: false });
        res.status(200).json({ message: 'Logged out successfully' });
    } else {
        res.status(401).json({ error: 'Not authenticated' });
    }
}


export default function securedHandler(req: NextApiRequest, res: NextApiResponse) {
    return authMiddleware(req, res, handler);
}