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

    // Log query and body if body is present
    let queryLog = query;
    if (body) {
        queryLog = { ...query, body };
    }
    let log = `\n${method} /api/tags\nRequest: ${JSON.stringify({ query: queryLog }, null, 2)}`;

    try {
        switch (method) {
            case 'GET':
                // Fetch tags with optional select and where parameters
                const { select, where } = query;
                const tags = await prisma.tag.findMany({
                    select: select ? JSON.parse(select as string) : undefined,
                    where: where ? JSON.parse(where as string) : undefined,
                });
                res.status(200).json(tags);
                log += `\nResponse Status: 200 OK`;
                break;

            case 'POST':
                // Create a new tag
                const { name, slug } = body;

                const nameError = validateInput(name, 'string');
                const slugError = validateInput(slug, 'string');

                if (nameError || slugError) {
                    log += `\nResponse Status: 400 ${nameError || slugError}`;
                    logger.info(log);
                    return res.status(400).json({ error: nameError || slugError });
                }

                const newTag = await prisma.tag.create({
                    data: {
                        name,
                        slug,
                    },
                });
                res.status(201).json(newTag);
                await res.revalidate('/tags');
                log += `\nResponse Status: 201 Created`;
                break;

            case 'PUT':
                // Update a tag by ID
                const { id, newName, newSlug } = body;

                const idError = validateInput(id, 'id');
                const newNameError = validateInput(newName, 'string');
                const newSlugError = validateInput(newSlug, 'string');

                if (idError || newNameError || newSlugError) {
                    log += `\nResponse Status: 400 ${idError || newNameError || newSlugError}`;
                    logger.info(log);
                    return res.status(400).json({ error: idError || newNameError || newSlugError });
                }

                const updatedTag = await prisma.tag.update({
                    where: { id: Number(id) },
                    data: {
                        name: newName,
                        slug: newSlug,
                    },
                });
                res.status(200).json(updatedTag);
                await res.revalidate('/tags');
                log += `\nResponse Status: 200 OK`;
                break;

            case 'DELETE':
                // Delete a tag by ID
                const { deleteId } = body;

                const deleteIdError = validateInput(deleteId, 'id');

                if (deleteIdError) {
                    log += `\nResponse Status: 400 ${deleteIdError}`;
                    logger.info(log);
                    return res.status(400).json({ error: deleteIdError });
                }

                const deletedTag = await prisma.tag.delete({
                    where: { id: Number(deleteId) },
                });
                res.status(200).json(deletedTag);
                await res.revalidate('/tags');
                log += `\nResponse Status: 200 OK`;
                break;

            default:
                res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
                log += `\nResponse Status: 405 Method ${method} Not Allowed`;
                res.status(405).end(`Method ${method} Not Allowed`);
        }
    } catch (error) {
        handleError(res, error, 'Internal Server Error');
    }

    logger.info(log);
}