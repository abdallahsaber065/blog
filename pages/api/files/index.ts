// pages/api/files.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { authMiddleware } from '@/middleware/authMiddleware';
import fs from 'fs';
import path from 'path';

async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    const { method, query } = req;

    try {
        switch (method) {
            case 'GET':
                const files = await prisma.fileLibrary.findMany({
                    where: {
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

                return res.status(200).json(files);

            case 'DELETE':
                const fileId = query.id;

                if (!fileId || Array.isArray(fileId)) {
                    res.status(400).json({ error: 'Invalid file ID' });
                    return;
                }

                // First, get the file details to know the file path
                const fileToDelete = await prisma.fileLibrary.findUnique({
                    where: { id: parseInt(fileId) }
                });

                if (!fileToDelete) {
                    res.status(404).json({ error: 'File not found' });
                    return;
                }

                // Delete the physical file
                const filePath = path.join(process.cwd(), 'public', fileToDelete.file_url);
                if (fs.existsSync(filePath)) {
                    try {
                        fs.unlinkSync(filePath);
                    } catch (error) {
                        console.error('Error deleting physical file:', error);
                        // Continue with database deletion even if physical file deletion fails
                    }
                }

                // Delete the database record
                await prisma.fileLibrary.delete({
                    where: { id: parseInt(fileId) }
                });

                return res.status(200).json({
                    message: 'File deleted successfully',
                    deletedFile: fileToDelete
                });

            default:
                res.setHeader('Allow', ['GET', 'DELETE']);
                res.status(405).end(`Method ${method} Not Allowed`);
                return;
        }
    } catch (error) {
        console.error('Files API Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

export default function securedHandler(req: NextApiRequest, res: NextApiResponse) {
    return authMiddleware(req, res, handler);
}