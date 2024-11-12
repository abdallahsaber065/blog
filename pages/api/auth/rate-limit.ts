// pages/api/auth/rate-limit.ts
import { NextApiRequest, NextApiResponse } from 'next';
import rateLimiters from '@/lib/rateLimit';
import { applyRateLimit } from '@/lib/applyRateLimit';
import requestIp from 'request-ip'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { apiRoute = 'login' } = req.query;


    const clientIp = requestIp.getClientIp(req) || 'unknown';
    console.log('clientIp', clientIp);

    try {
        await applyRateLimit(req, res, rateLimiters[apiRoute as keyof typeof rateLimiters], clientIp);
        res.status(200).json({ message: 'Rate limit check passed' });
    } catch (error: any)  {
        res.status(429).json({
            message: error.message || `Too many requests from IP ${clientIp}, please try again later`,
            ip: clientIp,
        });
    }
}