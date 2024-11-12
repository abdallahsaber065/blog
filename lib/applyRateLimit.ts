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
    console.log('req.ip:', req.ip);

    return new Promise((resolve, reject) => {
        limiter(req as any, res as any, (result: any) => {
            if (result instanceof Error) {
                return reject(result);
            }
            return resolve(result);
        });
    });
};