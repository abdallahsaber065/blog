import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { authMiddleware } from '@/middleware/authMiddleware';
import { revalidateRoutes, REVALIDATE_PATHS } from '@/lib/revalidate';

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
    } else if (type === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!input || !emailRegex.test(input)) {
            return 'Invalid email';
        }
    }
    return null;
};

// Utility function to handle errors
const handleError = (res: NextApiResponse, error: any, message: string) => {
    res.status(500).json({ error: message });
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method, query, body } = req;

    // Log query and body if body is present
    let queryLog = query;
    if (body) {
        queryLog = { ...query, body };
    }
    let log = `\n${method} /api/users\nRequest: ${JSON.stringify({ query: queryLog }, null, 2)}`;

    try {
        switch (method) {
            case 'GET':
                // Fetch users with optional select and where parameters
                const { select, where } = query;
                const users = await prisma.user.findMany({
                    select: select ? JSON.parse(select as string) : undefined,
                    where: where ? JSON.parse(where as string) : undefined,
                });
                res.status(200).json(users);
                log += `\nResponse Status: 200 OK`;
                break;

            case 'POST':
                // Create a new user
                const { username, email, password, first_name, last_name } = body;

                const usernameError = validateInput(username, 'string');
                const emailError = validateInput(email, 'email');
                const passwordError = validateInput(password, 'string');

                if (usernameError || emailError || passwordError) {
                    log += `\nResponse Status: 400 ${usernameError || emailError || passwordError}`;
                    return res.status(400).json({ error: usernameError || emailError || passwordError });
                }

                const hashedPassword = await bcrypt.hash(password, 10);

                const newUser = await prisma.user.create({
                    data: {
                        username,
                        email,
                        password: hashedPassword,
                        first_name,
                        last_name,
                    },
                });

                // Revalidate paths
                await revalidateRoutes(res, [
                    REVALIDATE_PATHS.AUTHORS,
                    REVALIDATE_PATHS.getAuthorPath(username)
                ]);

                res.status(201).json(newUser);
                log += `\nResponse Status: 201 Created`;
                break;

            case 'PUT':
                // Update a user by ID
                const { id, data } = body;

                const idError = validateInput(id, 'id');
                if (idError) {
                    log += `\nResponse Status: 400 ${idError}`;
                    return res.status(400).json({ error: idError });
                }

                const updatedData: any = {};

                // Validate and prepare update data
                for (const [key, value] of Object.entries(data)) {
                    if (key === 'username' || key === 'first_name' || key === 'last_name') {
                        const error = validateInput(value, 'string');
                        if (error) {
                            log += `\nResponse Status: 400 ${error}`;
                            return res.status(400).json({ error });
                        }
                        updatedData[key] = value;
                    } else if (key === 'email') {
                        const error = validateInput(value, 'email');
                        if (error) {
                            log += `\nResponse Status: 400 ${error}`;
                            return res.status(400).json({ error });
                        }
                        updatedData[key] = value;
                    } else if (key === 'password') {
                        const error = validateInput(value, 'string');
                        if (error) {
                            log += `\nResponse Status: 400 ${error}`;
                            return res.status(400).json({ error });
                        }
                        updatedData[key] = await bcrypt.hash(value as string, 10);
                    } else {
                        // add all other fields to updatedData
                        updatedData[key] = value;
                    }
                }

                const updatedUser = await prisma.user.update({
                    where: { id: Number(id) },
                    data: updatedData,
                });

                // Revalidate paths
                await revalidateRoutes(res, [
                    REVALIDATE_PATHS.AUTHORS,
                    REVALIDATE_PATHS.getAuthorPath(updatedUser.username)
                ]);

                res.status(200).json(updatedUser);
                log += `\nResponse Status: 200 OK`;
                break;

            case 'DELETE':
                // Delete a user by ID
                const { targetId } = body;

                const deleteIdError = validateInput(targetId, 'id');
                if (deleteIdError) {
                    log += `\nResponse Status: 400 ${deleteIdError}`;
                    return res.status(400).json({ error: deleteIdError });
                }

                const deletedUser = await prisma.user.delete({
                    where: { id: Number(targetId) },
                });

                // Revalidate paths
                await revalidateRoutes(res, [
                    REVALIDATE_PATHS.AUTHORS,
                    REVALIDATE_PATHS.getAuthorPath(deletedUser.username)
                ]);

                res.status(200).json(deletedUser);
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
}

export default function securedHandler(req: NextApiRequest, res: NextApiResponse) {
    return authMiddleware(req, res, handler);
}