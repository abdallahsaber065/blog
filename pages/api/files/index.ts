// pages/api/files/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { authMiddleware } from '@/middleware/authMiddleware';
import { getStorageProvider } from '@/lib/storage/factory';
import { resolvePublicUrl } from '@/lib/storage';
import { methodNotAllowed } from '@/lib/apiError';
import fs from 'fs';
import path from 'path';

async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    const { method, query } = req;

    try {
        switch (method) {
            case 'GET': {
                const storage = getStorageProvider();
                const files = await prisma.fileLibrary.findMany({
                    where: {
                        ...(query.folder && query.folder !== 'all'
                            ? { file_url: { contains: `${query.folder}` } }
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
                const filesWithUrls = files.map((f) => ({
                    ...f,
                    public_url: storage.getPublicUrl(f.file_url),
                }));
                return res.status(200).json(filesWithUrls);
            }

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

                // Delete the physical file via the storage provider
                const storageForDelete = getStorageProvider();
                await storageForDelete.delete(fileToDelete.file_url);
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
                methodNotAllowed(res, ['GET', 'DELETE']);
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