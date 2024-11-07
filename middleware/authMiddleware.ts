import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';

export async function authMiddleware(
    req: NextApiRequest,
    res: NextApiResponse,
    handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
) {
    // Check for valid session
    const session = await getSession({ req });

    if (!session) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    return handler(req, res);
}