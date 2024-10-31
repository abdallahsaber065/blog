import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import logger from '@/lib/logger';

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
    logger.error(`Internal Server Error: ${error.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
};

// API Handler
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method, query, body } = req;

    // log query and body if body is present
    let queryLog = query;
    if (body) {
        queryLog = { ...query, body };
    }
    let log = `\n${method} /api/media-library\nRequest: ${JSON.stringify({ query: queryLog })}`;

    try {
        switch (method) {
            case 'GET':
                const mediaItems = await prisma.mediaLibrary.findMany({
                    where: query.where ? JSON.parse(query.where as string) : undefined,
                    ...(query.include ? { include: JSON.parse(query.include as string) } : {}),
                    ...(query.select ? { select: JSON.parse(query.select as string) } : {}),
                });
                res.status(200).json(mediaItems);
                log += `\nResponse Status: 200 OK`;
                break;

            case 'POST':
                const postValidationError = validateRequiredFields(['file_name', 'file_url'], body);
                if (postValidationError) {
                    log += `\nResponse Status: 400 ${postValidationError}`;
                    logger.info(log);
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
                    logger.info(log);
                    return res.status(400).json({ error: putValidationError });
                }

                const idError = validateId(body.id);
                if (idError) {
                    log += `\nResponse Status: 400 ${idError}`;
                    logger.info(log);
                    return res.status(400).json({ error: idError });
                }

                const updatedMediaItem = await prisma.mediaLibrary.update({
                    where: { id: Number(body.id) },
                    data: body,
                });
                res.status(200).json(updatedMediaItem);
                log += `\nResponse Status: 200 OK`;
                break;

            case 'DELETE':
                const deleteIdError = validateId(query.id);
                if (deleteIdError) {
                    log += `\nResponse Status: 400 ${deleteIdError}`;
                    logger.info(log);
                    return res.status(400).json({ error: deleteIdError });
                }

                await prisma.mediaLibrary.delete({
                    where: { id: Number(query.id) },
                });
                res.status(200).json({ message: 'Media item deleted' });
                log += `\nResponse Status: 200 OK`;
                break;

            default:
                res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
                log += `\nResponse Status: 405 Method ${method} Not Allowed`;
                res.status(405).end(`Method ${method} Not Allowed`);
        }
    } catch (error) {
        handleError(res, error);
    }

    logger.info(log);
}