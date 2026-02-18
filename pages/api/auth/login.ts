import { NextApiRequest, NextApiResponse } from 'next';
import {prisma} from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authMiddleware } from '@/middleware/authMiddleware';
import { applyRateLimit } from '@/lib/applyRateLimit';
import rateLimiters from '@/lib/rateLimit';
import { apiError, methodNotAllowed } from '@/lib/apiError';

const SECRET_KEY = process.env.SECRET_KEY || 'your-secret-key';

async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Apply rate limiting using synchronous IP extraction
    const clientIp =
        (Array.isArray(req.headers['x-forwarded-for'])
            ? req.headers['x-forwarded-for'][0]
            : req.headers['x-forwarded-for']) ||
        req.socket?.remoteAddress ||
        'unknown';

    try {
        await applyRateLimit(req, res, rateLimiters.login, clientIp);
    } catch {
        // applyRateLimit already sent a 429 JSON response
        return;
    }
    // If the limiter itself sent a 429 (its own handler), bail out
    if (res.headersSent) return;

    const { method } = req;

    if (method !== 'POST') {
        return methodNotAllowed(res, ['POST']);
    }

    const { email, password } = req.body;

    if (!email || !password) {
        return apiError(res, 400, 'Email and password are required');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return apiError(res, 400, 'Invalid email format');
    }

    try {
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return apiError(res, 401, 'Invalid email or password');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return apiError(res, 401, 'Invalid email or password');
        }

        const token = jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: '1h' });

        res.setHeader('Set-Cookie', `token=${token}; HttpOnly; Path=/; Max-Age=3600; Secure; SameSite=Strict`);

        res.setHeader('Content-Security-Policy', "default-src 'self'");
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('X-XSS-Protection', '1; mode=block');

        res.status(200).json({ message: 'Login successful' });
    } catch (error) {
        console.error('Login error:', error);
        return apiError(res, 500, 'Internal server error');
    }
}


export default function securedHandler(req: NextApiRequest, res: NextApiResponse) {
    return authMiddleware(req, res, handler);
}