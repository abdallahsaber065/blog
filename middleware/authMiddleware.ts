import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';

export async function authMiddleware(
    req: NextApiRequest,
    res: NextApiResponse,
    handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
) {
    // Check for valid session
    const session = await getSession({ req });

    // Verify request origin
    const appOrigin = req.headers['x-app-origin'] as string;
    const allowedOrigins = [process.env.NEXT_PUBLIC_BASE_URL?.replace(/https?:\/\//, '')];
    console.log('origin', appOrigin);
    console.log('allowedOrigins', allowedOrigins);

    if (!allowedOrigins.includes(appOrigin?.replace(/https?:\/\//, '') || '')) {
        return res.status(403).json({ error: 'Forbidden' });
    }

    // Verify CSRF token
    const csrfToken = req.headers['x-csrf-token'];
    console.log('csrfToken', csrfToken);
    if (!csrfToken || csrfToken !== process.env.NEXT_PUBLIC_CSRF_TOKEN) {
        return res.status(403).json({ error: 'Invalid CSRF token' });
    }

    if (!session) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    return handler(req, res);
}