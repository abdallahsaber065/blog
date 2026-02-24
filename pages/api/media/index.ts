import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { authMiddleware } from '@/middleware/authMiddleware';
import { getStorageProvider } from '@/lib/storage/factory';
import { resolvePublicUrl } from '@/lib/storage';
import { apiError, methodNotAllowed } from '@/lib/apiError';

// Helper Functions
const validateRequiredFields = (fields: string[], body: any) => {
    for (const field of fields) {
        if (!body[field]) {
            return `Field ${field} is required.`;
        }
    }
    return null;
};

const validateId = (id: any) => {
    if (isNaN(Number(id))) {
        return 'Invalid ID.';
    }
    return null;
};

const handleError = (res: NextApiResponse, error: any) => {
    console.error('media API error:', error);
    apiError(res, 500, error?.message || 'Internal Server Error');
};

// API Handler
async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method, query, body } = req;

    // log query and body if body is present
    let queryLog = query;
    if (body) {
        queryLog = { ...query, body };
    }
    let log = `\n${method} /api/media-library\nRequest: ${JSON.stringify({ query: queryLog })}`;

    try {
        switch (method) {
            case 'GET': {
                const storage = getStorageProvider();
                const mediaItems = await prisma.mediaLibrary.findMany({
                    where: query.where ? JSON.parse(query.where as string) : { file_url: { contains: 'media' } },
                    ...(query.include ? { include: JSON.parse(query.include as string) } : {}),
                    ...(query.select ? { select: JSON.parse(query.select as string) } : {}),
                });
                const mediaWithUrls = mediaItems.map((item) => ({
                    ...item,
                    public_url: storage.getPublicUrl(item.file_url),
                }));
                res.status(200).json(mediaWithUrls);
                log += `\nResponse Status: 200 OK`;
                break;
            }

            case 'POST':
                const postValidationError = validateRequiredFields(['file_name', 'file_url'], body);
                if (postValidationError) {
                    log += `\nResponse Status: 400 ${postValidationError}`;

                    return res.status(400).json({ error: postValidationError });
                }

                const newMediaItem = await prisma.mediaLibrary.create({
                    data: body,
                });
                res.status(201).json(newMediaItem);
                log += `\nResponse Status: 201 Created`;
                break;

            case 'PUT':
                const putValidationError = validateRequiredFields(['id'], body);
                if (putValidationError) {
                    log += `\nResponse Status: 400 ${putValidationError}`;

                    return res.status(400).json({ error: putValidationError });
                }

                const idError = validateId(body.id);
                if (idError) {
                    log += `\nResponse Status: 400 ${idError}`;

                    return res.status(400).json({ error: idError });
                }

                const updatedMediaItem = await prisma.mediaLibrary.update({
                    where: { id: Number(body.id) },
                    data: body,
                });
                res.status(200).json(updatedMediaItem);
                log += `\nResponse Status: 200 OK`;
                break;

            case 'DELETE': {
                const deleteIdError = validateId(query.id);
                if (deleteIdError) {
                    log += `\nResponse Status: 400 ${deleteIdError}`;

                    return res.status(400).json({ error: deleteIdError });
                }

                const mediaToDelete = await prisma.mediaLibrary.findUnique({
                    where: { id: Number(query.id) },
                });

                if (mediaToDelete) {
                    const storage = getStorageProvider();
                    await storage.delete(mediaToDelete.file_url);
                }

                await prisma.mediaLibrary.delete({
                    where: { id: Number(query.id) },
                });
                res.status(200).json({ message: 'Media item deleted' });
                log += `\nResponse Status: 200 OK`;
                break;
            }

            default:
                log += `\nResponse Status: 405 Method ${method} Not Allowed`;
                methodNotAllowed(res);
        }
    } catch (error) {
        handleError(res, error);
    }


}


export default function securedHandler(req: NextApiRequest, res: NextApiResponse) {
    return authMiddleware(req, res, handler);
}