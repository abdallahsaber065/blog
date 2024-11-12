import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import logger from '@/lib/logger';
import { authMiddleware } from '@/middleware/authMiddleware';
import { REVALIDATE_PATHS, revalidateRoutes } from '@/lib/revalidate';

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
async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method, query, body } = req;

    // log query and body if body is present
    let queryLog = query;
    if (body) {
        queryLog = { ...query, body };
    }
    let log = `\n${method} /api/tags\nRequest: ${JSON.stringify({ query: queryLog })}`;

    try {
        switch (method) {
            case 'GET':
                const tags = await prisma.tag.findMany({
                    where: query.where ? JSON.parse(query.where as string) : undefined,
                    ...(query.include ? { include: JSON.parse(query.include as string) } : {}),
                    ...(query.select ? { select: JSON.parse(query.select as string) } : {}),
                });
                res.status(200).json(tags);
                log += `\nResponse Status: 200 OK`;
                break;

            case 'POST':
                const postValidationError = validateRequiredFields(['name', 'slug'], body);
                if (postValidationError) {
                    log += `\nResponse Status: 400 ${postValidationError}`;

                    return res.status(400).json({ error: postValidationError });
                }

                const newTag = await prisma.tag.create({
                    data: body,
                });
                res.status(201).json(newTag);
                await res.revalidate('/categories');
                log += `\nResponse Status: 201 Created`;
                break;

            case 'PUT':
                const putValidationError = validateRequiredFields(['id', 'data'], body);
                if (putValidationError) {
                    log += `\nResponse Status: 400 ${putValidationError}`;

                    return res.status(400).json({ error: putValidationError });
                }

                const idError = validateId(body.id);
                if (idError) {
                    log += `\nResponse Status: 400 ${idError}`;

                    return res.status(400).json({ error: idError });
                }

                const updatedTag = await prisma.tag.update({
                    where: { id: Number(body.id) },
                    data: body.data,
                });
                res.status(200).json(updatedTag);
                const routesToRevalidate = [
                    REVALIDATE_PATHS.HOME,
                    REVALIDATE_PATHS.CATEGORIES,
                    REVALIDATE_PATHS.CATEGORIES_ALL
                ];
                if (body.id) {
                    const tag = await prisma.tag.findUnique({
                        where: { id: Number(body.id) },
                        select: { slug: true }
                    });
                    if (tag) {
                        routesToRevalidate.push(REVALIDATE_PATHS.getCategoryPath(tag.slug));
                    }
                }
                await revalidateRoutes(res, routesToRevalidate);
                log += `\nResponse Status: 200 OK`;
                break;

            case 'DELETE':
                const deleteIdError = validateId(query.id);
                if (deleteIdError) {
                    log += `\nResponse Status: 400 ${deleteIdError}`;
                    return res.status(400).json({ error: deleteIdError });
                }

                // Get tag and its associated posts before deletion
                const tagToDelete = await prisma.tag.findUnique({
                    where: { id: Number(query.id) },
                    include: {
                        posts: {
                            select: { slug: true }
                        }
                    }
                });

                if (!tagToDelete) {
                    return res.status(404).json({ error: 'Tag not found' });
                }

                // Delete the tag
                await prisma.tag.delete({
                    where: { id: Number(query.id) },
                });
                // Prepare routes for revalidation
                const routesToRevalidateForDelete = [
                    REVALIDATE_PATHS.HOME,
                    REVALIDATE_PATHS.CATEGORIES,
                    REVALIDATE_PATHS.CATEGORIES_ALL,
                    REVALIDATE_PATHS.getCategoryPath(tagToDelete.slug)
                ];

                // Add all associated post paths
                tagToDelete.posts.forEach(post => {
                    routesToRevalidate.push(REVALIDATE_PATHS.getBlogPath(post.slug));
                });

                await revalidateRoutes(res, routesToRevalidateForDelete);
                res.status(200).json({ message: 'Tag deleted successfully' });
                break;

            default:
                res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
                log += `\nResponse Status: 405 Method ${method} Not Allowed`;
                res.status(405).end(`Method ${method} Not Allowed`);
        }
    } catch (error) {
        handleError(res, error);
    }


}


export default function securedHandler(req: NextApiRequest, res: NextApiResponse) {
    return authMiddleware(req, res, handler);
}