import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { options } from '@/pages/api/auth/[...nextauth]'; // Import your auth options

export async function authMiddleware(
    req: NextApiRequest,
    res: NextApiResponse,
    handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
) {
    console.log('Headers:', req.headers); // Log headers
    console.log('Cookies:', req.cookies); // Log cookies
    
    const session = await getServerSession(req, res, options);
    
    console.log('Session Data:', session); // Log full session data

    if (!session) {
        console.log('No session found'); // Debug log
        return res.status(401).json({ error: 'Unauthorized' });
    }

    return handler(req, res);
}