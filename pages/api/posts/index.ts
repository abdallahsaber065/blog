import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

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
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
};

// API Handler
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method, query, body } = req;

    const { where, include, select , limit } = query;

    try {
        switch (method) {
            case 'GET':
                const categories = await prisma.post.findMany({
                    where: where ? JSON.parse(where as string) : undefined,
                    ...(include ? { include: JSON.parse(include as string) } : {}),
                    ...(select ? { select: JSON.parse(select as string) } : {}),
                    ...(limit ? { take: Number(limit) } : {}),
                });
                res.status(200).json(categories);
                break;

            case 'POST':
                const postValidationError = validateRequiredFields(['title', 'content'], body);
                if (postValidationError) {
                    return res.status(400).json({ error: postValidationError });
                }

                const newCategory = await prisma.post.create({
                    data: body,
                });
                res.status(201).json(newCategory);
                break;

            case 'PUT':
                const putValidationError = validateRequiredFields(['id', 'data'], body);
                if (putValidationError) {
                    return res.status(400).json({ error: putValidationError });
                }

                const idError = validateId(body.id);
                if (idError) {
                    return res.status(400).json({ error: idError });
                }

                const updatedCategory = await prisma.post.update({
                    where: { id: Number(body.id) },
                    data: body.data,
                });
                res.status(200).json(updatedCategory);
                break;

            case 'DELETE':
                await prisma.post.deleteMany(); // Delete all data
                res.status(200).json({ message: 'All data deleted' });
                break;

            default:
                res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
                res.status(405).end(`Method ${method} Not Allowed`);
        }
    } catch (error) {
        handleError(res, error);
    }
}