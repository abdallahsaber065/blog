// pages/api/auth/rate-limit.ts
import { NextApiRequest, NextApiResponse } from 'next';
import rateLimiters from '@/lib/rateLimit';
import { applyRateLimit } from '@/lib/applyRateLimit';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { apiRoute = 'login' } = req.query;

    // Extract client's IP address using external service
    const ipResponse = await fetch('https://api.ipify.org?format=json');
    const ipData = await ipResponse.json();
    const clientIp = ipData.ip;
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