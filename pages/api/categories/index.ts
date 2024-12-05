import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { authMiddleware } from '@/middleware/authMiddleware';
import { REVALIDATE_PATHS } from '@/lib/revalidate';
import { revalidateRoutes } from '@/lib/revalidate';

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
    let log = `\n${method} /api/categories\nRequest: ${JSON.stringify({ query: queryLog })}`;

    try {
        switch (method) {
            case 'GET':
                const categories = await prisma.category.findMany({
                    where: query.where ? JSON.parse(query.where as string) : undefined,
                    ...(query.include ? { include: JSON.parse(query.include as string) } : {}),
                    ...(query.select ? { select: JSON.parse(query.select as string) } : {}),
                });
                res.status(200).json(categories);
                log += `\nResponse Status: 200 OK`;
                break;

            case 'POST':
                const postValidationError = validateRequiredFields(['name', 'slug'], body);
                if (postValidationError) {
                    log += `\nResponse Status: 400 ${postValidationError}`;

                    return res.status(400).json({ error: postValidationError });
                }

                const newCategory = await prisma.category.create({
                    data: body,
                });
                res.status(201).json(newCategory);
                await revalidateRoutes(res, [
                    REVALIDATE_PATHS.HOME,

                    REVALIDATE_PATHS.ALL_CATEGORIES
                ]);
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

                const updatedCategory = await prisma.category.update({
                    where: { id: Number(body.id) },
                    data: body.data,
                });
                res.status(200).json(updatedCategory);
                await revalidateRoutes(res, [
                    REVALIDATE_PATHS.HOME,

                    REVALIDATE_PATHS.ALL_CATEGORIES
                ]);
                log += `\nResponse Status: 200 OK`;
                break;

            case 'DELETE':
                const deleteIdError = validateId(query.id);
                if (deleteIdError) {
                    log += `\nResponse Status: 400 ${deleteIdError}`;
                    return res.status(400).json({ error: deleteIdError });
                }

                // Get category and its associated posts before deletion
                const categoryToDelete = await prisma.category.findUnique({
                    where: { id: Number(query.id) },
                    include: {
                        posts: {
                            select: { slug: true }
                        }
                    }
                });

                if (!categoryToDelete) {
                    return res.status(404).json({ error: 'Category not found' });
                }

                // Delete the category
                await prisma.category.delete({
                    where: { id: Number(query.id) },
                });

                // Prepare routes for revalidation
                const routesToRevalidate = [
                    REVALIDATE_PATHS.HOME,

                    REVALIDATE_PATHS.ALL_CATEGORIES,
                    REVALIDATE_PATHS.getCategoryPath(categoryToDelete.slug)
                ];

                // Add all associated post paths
                categoryToDelete.posts.forEach(post => {
                    routesToRevalidate.push(REVALIDATE_PATHS.getBlogPath(post.slug));
                });

                await revalidateRoutes(res, routesToRevalidate);
                res.status(200).json({ message: 'Category deleted successfully' });
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