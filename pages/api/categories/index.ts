import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import logger from '@/lib/logger';

// Utility function to validate input
const validateInput = (input: any, type: string): string | null => {
    if (type === 'id') {
        if (!input || isNaN(Number(input))) {
            return 'Invalid ID';
        }
    } else if (type === 'string') {
        if (!input || typeof input !== 'string' || input.trim() === '') {
            return 'Invalid string';
        }
    }
    return null;
};

// Utility function to handle errors
const handleError = (res: NextApiResponse, error: any, message: string) => {
    logger.error(`${message}: ${error.message}`);
    res.status(500).json({ error: message });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method, query, body } = req;

    // log query and body if body is present
    let queryLog = query;
    if (body) {
        queryLog = { ...query, body };
    }
    let log = `\n${method} /api/tags\nRequest: ${JSON.stringify({ query: queryLog })}`;
    switch (method) {
        case 'GET':
            // Fetch categories with optional select and where parameters
            try {
                const { select, where } = query;
                const categories = await prisma.category.findMany({
                    select: select ? JSON.parse(select as string) : undefined,
                    where: where ? JSON.parse(where as string) : undefined,
                });
                res.status(200).json(categories);
            } catch (error) {
                handleError(res, error, 'Failed to fetch categories');
            }
            break;

        case 'POST':
            // Create a new category
            const { name, slug, description } = body;

            const nameError = validateInput(name, 'string');
            const slugError = validateInput(slug, 'string');

            if (nameError || slugError) {
                return res.status(400).json({ error: nameError || slugError });
            }

            try {
                const newCategory = await prisma.category.create({
                    data: {
                        name,
                        slug,
                        description: description || '',
                    },
                });
                res.status(201).json(newCategory);
                await res.revalidate('/categories');
            } catch (error) {
                handleError(res, error, 'Failed to create category');
            }
            break;

        case 'PUT':
            // Update a category by ID
            const { id, newName, newSlug, newDescription } = body;

            const idError = validateInput(id, 'id');
            const newNameError = validateInput(newName, 'string');
            const newSlugError = validateInput(newSlug, 'string');

            if (idError || newNameError || newSlugError) {
                return res.status(400).json({ error: idError || newNameError || newSlugError });
            }

            try {
                const updatedCategory = await prisma.category.update({
                    where: { id: Number(id) },
                    data: {
                        name: newName,
                        slug: newSlug,
                        description: newDescription || '',
                    },
                });
                res.status(200).json(updatedCategory);
                await res.revalidate('/categories');
            } catch (error) {
                handleError(res, error, 'Failed to update category');
            }
            break;

        case 'DELETE':
            // Delete a category by ID
            const { deleteId } = body;

            const deleteIdError = validateInput(deleteId, 'id');

            if (deleteIdError) {
                return res.status(400).json({ error: deleteIdError });
            }

            try {
                const deletedCategory = await prisma.category.delete({
                    where: { id: Number(deleteId) },
                });
                res.status(200).json(deletedCategory);
                await res.revalidate('/categories');
            } catch (error) {
                handleError(res, error, 'Failed to delete category');
            }
            break;

        default:
            res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
            res.status(405).end(`Method ${method} Not Allowed`);
    }
    log += `\nResponse Status: ${res.statusCode} ${res.statusMessage}`;
    logger.info(log);
}