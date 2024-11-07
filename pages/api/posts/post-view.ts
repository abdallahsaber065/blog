import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { authMiddleware } from '@/middleware/authMiddleware';

async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { post_id } = req.body;

        // Fetch viewer IP address
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipResponse.json();
        const viewer_ip = ipData.ip;
        console.log('Viewer IP:', viewer_ip);

        try {
            // Insert new PostView record
            await prisma.postView.create({
                data: {
                    post_id: parseInt(post_id, 10),
                    viewer_ip: viewer_ip as string,
                },
            });

            res.status(200).json({ message: 'Post view recorded' });
        } catch (error) {
            res.status(500).json({ error: 'Error recording post view' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}


export default function securedHandler(req: NextApiRequest, res: NextApiResponse) {
    return authMiddleware(req, res, handler);
}