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
    const start = Date.now();

    try {
        const session = await getServerSession(req, res, options);
        const isPublicEndpoint = publicEndpoints.includes(req.url || '');

        console.info(`${req.method} ${req.url ? decodeURIComponent(req.url) : ''} isPublic:${isPublicEndpoint} authenticated:${!!session}`);

        if (isPublicEndpoint) {
            return handler(req, res);
        }

        if (!session) {
            console.warn({
                message: 'Unauthorized access attempt',
                url: req.url,
                method: req.method,
                timestamp: new Date().toISOString()
            });
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const result = await handler(req, res);
        const duration = Date.now() - start;

        console.info({
            message: 'Request completed',
            method: req.method,
            url: req.url,
            duration: `${duration}ms`,
            statusCode: res.statusCode
        });

        return result;
    } catch (error) {
        console.error({
            message: 'Request failed',
            method: req.method,
            url: req.url,
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        });
        throw error;
    }
}