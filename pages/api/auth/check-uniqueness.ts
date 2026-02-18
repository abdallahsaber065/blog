// pages/api/auth/check-uniqueness.ts
import { NextApiRequest, NextApiResponse } from 'next';
import {prisma} from '@/lib/prisma';
import { authMiddleware } from '@/middleware/authMiddleware';
import { applyRateLimit } from '@/lib/applyRateLimit';
import rateLimiters from '@/lib/rateLimit';
import { apiError, methodNotAllowed } from '@/lib/apiError';

async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;

    // Apply rate limiting
    const clientIp =
        (Array.isArray(req.headers['x-forwarded-for'])
            ? req.headers['x-forwarded-for'][0]
            : req.headers['x-forwarded-for']) ||
        req.socket?.remoteAddress ||
        'unknown';

    try {
        await applyRateLimit(req, res, rateLimiters.checkUniqueness, clientIp);
    } catch {
        return;
    }
    if (res.headersSent) return;

    if (method !== 'POST') {
        return methodNotAllowed(res, ['POST']);
    }

    const { username, email } = req.body;

    if (!username || !email) {
        return apiError(res, 400, 'Username and email are required');
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
            return apiError(res, 400, 'Email or username already exists');
        }

        res.status(200).json({ message: 'Username and email are unique' });
    } catch (error) {
        console.error('check-uniqueness error:', error);
        return apiError(res, 500, 'Internal server error');
    }
}


export default function securedHandler(req: NextApiRequest, res: NextApiResponse) {
    return authMiddleware(req, res, handler);
}