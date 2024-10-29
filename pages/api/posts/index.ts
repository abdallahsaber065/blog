// pages/api/posts/index.ts
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

const handleError = (res: NextApiResponse, error: any, message: string) => {
    logger.error(`${message}: ${error.message}`);
    res.status(500).json({ error: message });
};

// API Handler
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method, query, body } = req;

    // Log query and body if body is present
    let queryLog = query;
    if (body) {
        queryLog = { ...query, body };
    }
    let log = `\n${method} /api/posts\nRequest: ${JSON.stringify({ query: queryLog }, null, 2)}`;

    try {
        switch (method) {
            case 'GET':
                const posts = await prisma.post.findMany({
                    where: query.where ? JSON.parse(query.where as string) : undefined,
                    ...(query.include ? { include: JSON.parse(query.include as string) } : {}),
                    ...(query.select ? { select: JSON.parse(query.select as string) } : {}),
                    ...(query.limit ? { take: Number(query.limit) } : {}),
                });
                res.status(200).json(posts);
                log += `\nResponse Status: 200 OK`;
                break;

            case 'POST':
                const postValidationError = validateRequiredFields(['title', 'content'], body);
                if (postValidationError) {
                    log += `\nResponse Status: 400 ${postValidationError}`;
                    logger.info(log);
                    return res.status(400).json({ error: postValidationError });
                }

                const newPost = await prisma.post.create({
                    data: body,
                });
                res.status(201).json(newPost);
                await res.revalidate("/");
                await res.revalidate('/categories/all');
                for (const tag of body.tags.connectOrCreate) {
                    const slug = tag.where.slug;
                    await res.revalidate(`/categories/${slug}`);
                }

                log += `\nResponse Status: 201 Created`;
                break;

            case 'PUT':
                const putValidationError = validateRequiredFields(['id', 'data'], body);
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

                const updateData: any = {};

                if (body.data.tags) {
                    updateData.tags = {
                        set: body.data.tags.map((tag: any) => ({ id: tag.id })),
                    };
                }

                if (body.data.category) {
                    updateData.category = {
                        connect: {
                            id: body.data.category.id,
                        },
                    };
                }

                if (body.data.author) {
                    updateData.author = {
                        connect: {
                            id: body.data.author.id,
                        },
                    };
                }

                // Get all remaining linear data in one object by removing the above data from the body
                let linearData = { ...body.data };
                delete linearData.tags;
                delete linearData.category;
                delete linearData.author;

                // Add each remaining linear data to the updateData object
                for (const key in linearData) {
                    updateData[key] = linearData[key];
                }

                const updatedPost = await prisma.post.update({
                    where: { id: Number(body.id) },
                    data: updateData,
                });
                res.status(200).json(updatedPost);
                await res.revalidate("/");
                await res.revalidate('/categories');
                log += `\nResponse Status: 200 OK`;
                break;

            case 'DELETE':
                const deleteIdError = validateId(query.id);
                if (deleteIdError) {
                    log += `\nResponse Status: 400 ${deleteIdError}`;
                    logger.info(log);
                    return res.status(400).json({ error: deleteIdError });
                }

                try {
                    await prisma.post.delete({
                        where: { id: Number(query.id) },
                    });
                    res.status(200).json({ message: 'Post deleted successfully' });
                    await res.revalidate("/");
                    await res.revalidate('/categories');
                    log += `\nResponse Status: 200 OK`;
                }
                catch (error) {
                    handleError(res, error, 'Failed to delete post');
                }
                
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