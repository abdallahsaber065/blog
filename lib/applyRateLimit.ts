// lib/applyRateLimit.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { RequestHandler } from 'express';
import axios from 'axios';

// Extend NextApiRequest to include the ip property
interface ExtendedNextApiRequest extends NextApiRequest {
    ip?: string;
}

export const applyRateLimit = async (req: ExtendedNextApiRequest, res: NextApiResponse, limiter: RequestHandler) => {
    // Manually set the request.ip property
    if (!req.ip) {
        const ip = req.headers['x-forwarded-for']?.toString() || req.socket.remoteAddress || '';
        if (!ip) {
            try {
                const response = await axios.get('https://api64.ipify.org?format=json');
                req.ip = response.data.ip;
            } catch (error) {
                console.error('Failed to fetch IP address:', error);
                req.ip = '';
            }
        } else {
            req.ip = ip;
        }
    }

    return new Promise((resolve, reject) => {
        limiter(req as any, res as any, (result: any) => {
            if (result instanceof Error) {
                return reject(result);
            }
            return resolve(result);
        });
    });
};