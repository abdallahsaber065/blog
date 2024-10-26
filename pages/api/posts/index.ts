// pages/api/posts/index.ts
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
    const { where, include, select, limit } = query;
    console.log('Method:', method);
    console.log('Query:', query);
    console.log('Body:', body);

    try {
        switch (method) {
            case 'GET':
                const posts = await prisma.post.findMany({
                    where: where ? JSON.parse(where as string) : undefined,
                    ...(include ? { include: JSON.parse(include as string) } : {}),
                    ...(select ? { select: JSON.parse(select as string) } : {}),
                    ...(limit ? { take: Number(limit) } : {}),
                });
                res.status(200).json(posts);
                break;

            case 'POST':
                const postValidationError = validateRequiredFields(['title', 'content'], body);
                if (postValidationError) {
                    return res.status(400).json({ error: postValidationError });
                }

                const newPost = await prisma.post.create({
                    data: body,
                });
                res.status(201).json(newPost);
                await res.revalidate("/");
                await res.revalidate('/categories');
                break;

            case 'PUT':
                const putValidationError = validateRequiredFields(['id', 'data'], body);
                if (putValidationError) {
                    return res.status(400).json({ error: putValidationError });
                }
            
                const idError = validateId(body.id);
                if (idError) {
                    console.log(idError);
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

                // get all remaining linear data in one object by removing the above data from the body
                let linearData = { ...body.data };
                delete linearData.tags;
                delete linearData.category;
                delete linearData.author;

                // add each remaining linear data to the updateData object
                for (const key in linearData) {
                    updateData[key] = linearData[key];
                }
                
                try {
                    const updatedPost = await prisma.post.update({
                        where: { id: Number(body.id) },
                        data: updateData,
                    });
                    res.status(200).json(updatedPost);
                    await res.revalidate("/");
                    await res.revalidate('/categories');
                } catch (error) {
                    console.log(error);
                    res.status(500).json({ error: 'Internal Server Error' });
                }
                break;

            case 'DELETE':
                const deleteIdError = validateId(query.id);
                if (deleteIdError) {
                    return res.status(400).json({ error: deleteIdError });
                }

                await prisma.post.delete({
                    where: { id: Number(query.id) },
                });
                res.status(200).json({ message: 'Post deleted successfully' });
                await res.revalidate("/");
                await res.revalidate('/categories');
                break;

            default:
                res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
                res.status(405).end(`Method ${method} Not Allowed`);
        }
    } catch (error) {
        handleError(res, error);
    }
}