// pages/api/posts/index.ts
import { prisma } from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';

import { REVALIDATE_PATHS, revalidateRoutes } from '@/lib/revalidate';
import { authMiddleware } from '@/middleware/authMiddleware';
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

const handleError = (res: NextApiResponse, error: any, message: string) => {
    console.error('posts API error:', error);
    apiError(res, 500, error?.message || message);
};

// API Handler
// Helper: find or create a tag robustly (handles name+slug uniqueness)
async function findOrCreateTag(name: string, requestedSlug: string) {
    // Try to find existing tag by name (case-insensitive) first
    const existing = await prisma.tag.findFirst({
        where: { name: { equals: name, mode: 'insensitive' } }
    });
    if (existing) return existing;
    // Try creating; if concurrent creation races, fall back to findFirst
    try {
        return await prisma.tag.create({ data: { name, slug: requestedSlug } });
    } catch {
        const found = await prisma.tag.findFirst({
            where: { name: { equals: name, mode: 'insensitive' } }
        });
        if (found) return found;
        throw new Error(`Could not find or create tag: ${name}`);
    }
}

// Helper: find or create a category robustly
async function findOrCreateCategory(name: string, requestedSlug: string) {
    const existing = await prisma.category.findFirst({
        where: { name: { equals: name, mode: 'insensitive' } }
    });
    if (existing) return existing;
    try {
        return await prisma.category.create({ data: { name, slug: requestedSlug } });
    } catch {
        const found = await prisma.category.findFirst({
            where: { name: { equals: name, mode: 'insensitive' } }
        });
        if (found) return found;
        throw new Error(`Could not find or create category: ${name}`);
    }
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
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
                    return res.status(400).json({ error: postValidationError });
                }

                // Check for similar titles
                const existingPost = await prisma.post.findFirst({
                    where: {
                        title: {
                            equals: body.title,
                            mode: 'insensitive' // Case-insensitive comparison
                        }
                    }
                });

                if (existingPost) {
                    log += `\nResponse Status: 400 Duplicate title`;
                    return res.status(400).json({
                        error: 'A post with this title already exists. Please choose a different title.'
                    });
                }

                // Pre-upsert tags to avoid unique constraint conflicts on name/slug
                const tagConnects: { id: number }[] = [];
                if (body.tags?.connectOrCreate) {
                    for (const op of body.tags.connectOrCreate) {
                        const tag = await findOrCreateTag(op.create.name, op.create.slug);
                        tagConnects.push({ id: tag.id });
                    }
                }

                // Pre-upsert category
                let categoryConnect: { id: number } | undefined;
                if (body.category?.connectOrCreate) {
                    const catCreate = body.category.connectOrCreate.create;
                    const cat = await findOrCreateCategory(catCreate.name, catCreate.slug);
                    categoryConnect = { id: cat.id };
                }

                // Build clean post data replacing connectOrCreate with connect
                const { tags: _bodyTags, category: _bodyCategory, ...restPostBody } = body;
                const postCreateData: any = { ...restPostBody };
                if (tagConnects.length > 0) {
                    postCreateData.tags = { connect: tagConnects };
                }
                if (categoryConnect) {
                    postCreateData.category = { connect: categoryConnect };
                }

                const newPost = await prisma.post.create({
                    data: postCreateData,
                });

                const postRoutesToRevalidate = [
                    REVALIDATE_PATHS.getBlogPath(newPost.slug),
                    REVALIDATE_PATHS.HOME,

                    REVALIDATE_PATHS.EXPLORE,
                    REVALIDATE_PATHS.ABOUT
                ];

                if (body.category?.value) {
                    postRoutesToRevalidate.push(
                        REVALIDATE_PATHS.getExploreCategoryPath(body.category.value)
                    );
                }
                if (body.tags?.length > 0) {
                    body.tags.forEach((tag: { value: string }) => {
                        postRoutesToRevalidate.push(
                            REVALIDATE_PATHS.getExploreTagPath(tag.value)
                        );
                    });
                }

                // authors pages to revalidate
                postRoutesToRevalidate.push(REVALIDATE_PATHS.AUTHORS);
                const user = await prisma.user.findUnique({
                    where: { id: newPost.author_id || undefined },
                    select: { username: true }
                });
                if (user?.username) {
                    postRoutesToRevalidate.push(REVALIDATE_PATHS.getAuthorPath(user.username));
                }
                console.log('postRoutesToRevalidate', postRoutesToRevalidate);
                await revalidateRoutes(res, postRoutesToRevalidate);
                res.status(201).json(newPost);
                log += `\nResponse Status: 201 Created`;
                break;

            case 'PUT':
                const updateIdError = validateId(body.id);
                if (updateIdError) {
                    log += `\nResponse Status: 400 ${updateIdError}`;
                    return res.status(400).json({ error: updateIdError });
                }

                const oldPost = await prisma.post.findUnique({
                    where: { id: Number(body.id) },
                    select: {
                        slug: true,
                        status: true,
                        category: {
                            select: {
                                slug: true
                            }
                        },
                        tags: {
                            select: {
                                slug: true
                            }
                        },
                        published_at: true,
                    }
                });

                if (!oldPost) {
                    log += `\nResponse Status: 404 Post not found`;
                    return res.status(404).json({ error: 'Post not found' });
                }

                // Transform the author data to use connect instead of direct assignment
                const updateData = { ...body.data };
                if (updateData.author) {
                    updateData.author = {
                        connect: { id: updateData.author.id }
                    };
                }

                // Pre-upsert tags to avoid unique constraint conflicts (same as POST)
                if (updateData.tags?.connectOrCreate) {
                    const tagConnectsForUpdate: { id: number }[] = [];
                    for (const op of updateData.tags.connectOrCreate) {
                        const tag = await findOrCreateTag(op.create.name, op.create.slug);
                        tagConnectsForUpdate.push({ id: tag.id });
                    }
                    updateData.tags = {
                        set: [],
                        connect: tagConnectsForUpdate,
                    };
                }

                // Pre-upsert category to avoid unique constraint conflicts (same as POST)
                if (updateData.category?.connectOrCreate) {
                    const catCreate = updateData.category.connectOrCreate.create;
                    const cat = await findOrCreateCategory(catCreate.name, catCreate.slug);
                    updateData.category = { connect: { id: cat.id } };
                }

                // check if status is being updated to published to add published_at date
                if (updateData.status === 'published' && (oldPost.status !== 'published' || oldPost.published_at === null)) {
                    updateData.published_at = new Date();
                }

                const updatedPost = await prisma.post.update({
                    where: { id: Number(body.id) },
                    data: updateData,
                    select: {
                        author: {
                            select: {
                                username: true
                            }
                        },
                        slug: true,
                        status: true,
                        category: {
                            select: {
                                slug: true
                            }
                        },
                        tags: {
                            select: {
                                slug: true
                            }
                        }
                    }
                });

                const routesToRevalidate = [
                    REVALIDATE_PATHS.HOME,

                    REVALIDATE_PATHS.EXPLORE,
                    REVALIDATE_PATHS.ABOUT
                ];

                // Add author page to revalidate
                if (updatedPost.author?.username) {
                    routesToRevalidate.push(REVALIDATE_PATHS.getAuthorPath(updatedPost.author.username));
                }

                // Add both old and new paths
                if (oldPost.slug) {
                    routesToRevalidate.push(REVALIDATE_PATHS.getBlogPath(oldPost.slug));
                }
                if (updatedPost.slug && oldPost.slug !== updatedPost.slug) {
                    routesToRevalidate.push(REVALIDATE_PATHS.getBlogPath(updatedPost.slug));
                }

                // Add category paths
                if (oldPost.category?.slug) {
                    routesToRevalidate.push(REVALIDATE_PATHS.getExploreCategoryPath(oldPost.category.slug));
                }
                if (updatedPost.category?.slug && oldPost.category?.slug !== updatedPost.category.slug) {
                    routesToRevalidate.push(REVALIDATE_PATHS.getExploreCategoryPath(updatedPost.category.slug));
                }

                // Add tag paths
                const oldTags = oldPost.tags.map(tag => tag.slug);
                const newTags = updatedPost.tags.map(tag => tag.slug);
                [...oldTags, ...newTags].forEach(slug => {
                    routesToRevalidate.push(REVALIDATE_PATHS.getExploreTagPath(slug));
                });

                await revalidateRoutes(res, routesToRevalidate);

                res.status(200).json(updatedPost);
                log += `\nResponse Status: 200 OK`;
                break;

            case 'DELETE':
                const deleteIdError = validateId(query.id);
                if (deleteIdError) {
                    log += `\nResponse Status: 400 ${deleteIdError}`;
                    return res.status(400).json({ error: deleteIdError });
                }

                // Get post details before deletion
                const postToDelete = await prisma.post.findUnique({
                    where: { id: Number(query.id) },
                    include: {
                        author: {
                            select: {
                                username: true
                            }
                        },
                        category: true,
                        tags: true
                    }
                });

                await prisma.post.delete({
                    where: { id: Number(query.id) },
                });

                const deleteRoutesToRevalidate = [
                    REVALIDATE_PATHS.getBlogPath(postToDelete?.slug || ''),
                    REVALIDATE_PATHS.HOME,
                    REVALIDATE_PATHS.ABOUT,

                    REVALIDATE_PATHS.EXPLORE
                ];

                // Add author page to revalidate
                if (postToDelete?.author?.username) {
                    deleteRoutesToRevalidate.push(REVALIDATE_PATHS.getAuthorPath(postToDelete.author.username));
                }

                if (postToDelete?.category?.slug) {
                    deleteRoutesToRevalidate.push(
                        REVALIDATE_PATHS.getExploreCategoryPath(postToDelete.category.slug)
                    );
                }

                postToDelete?.tags.forEach(tag => {
                    deleteRoutesToRevalidate.push(
                        REVALIDATE_PATHS.getExploreTagPath(tag.slug)
                    );
                });

                await revalidateRoutes(res, deleteRoutesToRevalidate);
                res.status(200).json({ message: 'Post deleted successfully' });
                log += `\nResponse Status: 200 OK`;
                break;

            default:
                res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
                log += `\nResponse Status: 405 Method ${method} Not Allowed`;
                methodNotAllowed(res);
        }
        console.log(log);
    } catch (error) {
        handleError(res, error, 'Internal Server Error');
    }
}

export default function securedHandler(req: NextApiRequest, res: NextApiResponse) {
    return authMiddleware(req, res, handler);
}
