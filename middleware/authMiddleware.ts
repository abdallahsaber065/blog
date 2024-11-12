import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { options } from '@/pages/api/auth/[...nextauth]';

const publicEndpoints = [
    '/api/auth/signup',
    '/api/auth/reset-password',
    '/api/auth/request-password-reset',
    '/api/auth/check-uniqueness'
];

export async function authMiddleware(
    req: NextApiRequest,
    res: NextApiResponse,
    handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
) {

    const session = await getServerSession(req, res, options);
    if (publicEndpoints.includes(req.url || '')) {
        return handler(req, res);
    }

    if (!session) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    return handler(req, res);
}