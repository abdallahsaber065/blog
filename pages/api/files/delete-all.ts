import { NextApiRequest, NextApiResponse } from 'next';
import { authMiddleware } from '@/middleware/authMiddleware';
import { prisma } from '@/lib/prisma';

async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'DELETE') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Delete all media records
        await prisma.fileLibrary.deleteMany({});

        return res.status(200).json({ message: 'All media files deleted successfully' });
    } catch (error) {
        console.error('Error deleting media files:', error);
        return res.status(500).json({ error: 'Failed to delete media files' });
    }
}

// Wrap the handler with authentication middleware
export default async function deleteAllMedia(req: NextApiRequest, res: NextApiResponse) {
    return authMiddleware(req, res, handler);
}