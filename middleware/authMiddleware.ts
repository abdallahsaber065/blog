import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { options } from '@/pages/api/auth/[...nextauth]'; // Import your auth options

export async function authMiddleware(
    req: NextApiRequest,
    res: NextApiResponse,
    handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
) {

    const session = await getServerSession(req, res, options);
    if (!session) {
        console.log('No session found'); // Debug log
        return res.status(401).json({ error: 'Unauthorized' });
    }

    return handler(req, res);
}