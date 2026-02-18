// lib/applyRateLimit.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { RequestHandler } from 'express';

// Extend NextApiRequest to include the ip property
interface ExtendedNextApiRequest extends NextApiRequest {
    ip?: string;
}

export const applyRateLimit = async (req: ExtendedNextApiRequest, res: NextApiResponse, limiter: RequestHandler, clientIp: string) => {
    // Manually set the request.ip property
    req.ip = clientIp;

    return new Promise<void>((resolve, reject) => {
        limiter(req as any, res as any, (result: any) => {
            if (result instanceof Error) {
                // express-rate-limit calls next(err) — treat as 429
                res.status(429).json({ error: result.message || 'Too many requests. Please try again later.' });
                return reject(result);
            }
            // If the rate limiter already sent a 429 response itself, resolve so we
            // can detect res.headersSent in the caller and bail out cleanly.
            return resolve(result);
        });
    });
};