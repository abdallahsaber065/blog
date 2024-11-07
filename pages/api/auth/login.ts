import { NextApiRequest, NextApiResponse } from 'next';
import {prisma} from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit, { ValueDeterminingMiddleware } from 'express-rate-limit';
import { Request, Response } from 'express';
import { authMiddleware } from '@/middleware/authMiddleware';

const SECRET_KEY = process.env.SECRET_KEY || 'your-secret-key';

const keyGenerator: ValueDeterminingMiddleware<string> = (req: Request) => {
    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
    return Array.isArray(ipAddress) ? ipAddress[0] : ipAddress;
};

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many login attempts from this IP, please try again after 15 minutes',
    keyGenerator,
});

async function handler(req: NextApiRequest, res: NextApiResponse) {
    await new Promise((resolve, reject) => {
        limiter(req as any, res as any, (result: any) => {
            if (result instanceof Error) {
                return reject(result);
            }
            resolve(result);
        });
    });

    const { method } = req;

    if (method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${method} Not Allowed`);
        return 
    }

    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return 
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        res.status(400).json({ error: 'Invalid email format' });
        return 
    }

    try {
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            res.status(401).json({ error: 'Invalid email or password' });
            return 
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            res.status(401).json({ error: 'Invalid email or password' });
            return 
        }

        const token = jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: '1h' });

        res.setHeader('Set-Cookie', `token=${token}; HttpOnly; Path=/; Max-Age=3600; Secure; SameSite=Strict`);

        res.setHeader('Content-Security-Policy', "default-src 'self'");
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('X-XSS-Protection', '1; mode=block');

        res.status(200).json({ message: 'Login successful' });
    } catch (error) {
        console.error('Internal server error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}


export default function securedHandler(req: NextApiRequest, res: NextApiResponse) {
    return authMiddleware(req, res, handler);
}