import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

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
    console.error(message, error);
    res.status(500).json({ error: message });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;

    switch (method) {
        case 'GET':
            // Fetch post views with optional select and where parameters
            try {
                const { select, where } = req.query;
                const postViews = await prisma.postView.findMany({
                    select: select ? JSON.parse(select as string) : undefined,
                    where: where ? JSON.parse(where as string) : undefined,
                });
                res.status(200).json(postViews);
            } catch (error) {
                handleError(res, error, 'Failed to fetch post views');
            }
            break;

        case 'POST':
            // Create a new post view
            const { post_id, viewer_ip } = req.body;

            const postIdError = validateInput(post_id, 'id');

            if (postIdError) {
                return res.status(400).json({ error: postIdError });
            }

            try {
                const newPostView = await prisma.postView.create({
                    data: {
                        post_id: Number(post_id),
                        viewer_ip: viewer_ip || '',
                    },
                });
                res.status(201).json(newPostView);
                await res.revalidate('/post-views');
            } catch (error) {
                handleError(res, error, 'Failed to create post view');
            }
            break;

        case 'PUT':
            // Update a post view by ID
            const { id, newPostId, newViewerIp } = req.body;

            const idError = validateInput(id, 'id');
            const newPostIdError = validateInput(newPostId, 'id');

            if (idError || newPostIdError) {
                return res.status(400).json({ error: idError || newPostIdError });
            }

            try {
                const updatedPostView = await prisma.postView.update({
                    where: { id: Number(id) },
                    data: {
                        post_id: Number(newPostId),
                        viewer_ip: newViewerIp || '',
                    },
                });
                res.status(200).json(updatedPostView);
                await res.revalidate('/post-views');
            } catch (error) {
                handleError(res, error, 'Failed to update post view');
            }
            break;

        case 'DELETE':
            // Delete a post view by ID
            const { deleteId } = req.body;

            const deleteIdError = validateInput(deleteId, 'id');

            if (deleteIdError) {
                return res.status(400).json({ error: deleteIdError });
            }

            try {
                const deletedPostView = await prisma.postView.delete({
                    where: { id: Number(deleteId) },
                });
                res.status(200).json(deletedPostView);
                await res.revalidate('/post-views');
            } catch (error) {
                handleError(res, error, 'Failed to delete post view');
            }
            break;

        default:
            res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
            res.status(405).end(`Method ${method} Not Allowed`);
    }
}