// pages/api/files.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { authMiddleware } from '@/middleware/authMiddleware';

async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method, query } = req;

    try {
        switch (method) {
            case 'GET':
                const files = await prisma.fileLibrary.findMany({
                    where: {
                        // Filter by folder if specified
                        ...(query.folder && query.folder !== 'all' 
                            ? { file_url: { contains: `uploads/${query.folder}` } }
                            : {}
                        )
                    },
                    orderBy: {
                        uploaded_at: 'desc'
                    },
                    include: {
                        uploaded_by: {
                            select: {
                                username: true,
                                email: true
                            }
                        }
                    }
                });

                res.status(200).json(files);

            default:
                res.setHeader('Allow', ['GET']);
                res.status(405).end(`Method ${method} Not Allowed`);
        }
    } catch (error) {
        console.error('Files API Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

export default function securedHandler(req: NextApiRequest, res: NextApiResponse) {
    return authMiddleware(req, res, handler);
}