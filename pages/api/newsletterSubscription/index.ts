import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import logger from '@/lib/logger';
import { authMiddleware } from '@/middleware/authMiddleware';

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
    } else if (type === 'boolean') {
        if (typeof input !== 'boolean') {
            return 'Invalid boolean';
        }
    }
    return null;
};

// Utility function to handle errors
const handleError = (res: NextApiResponse, error: any, message: string) => {
    logger.error(`${message}: ${error.message}`);
    res.status(500).json({ error: message });
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method, query, body } = req;

    // Log query and body if body is present
    let queryLog = query;
    if (body) {
        queryLog = { ...query, body };
    }
    let log = `\n${method} /api/newsletter-subscriptions\nRequest: ${JSON.stringify({ query: queryLog }, null, 2)}`;

    switch (method) {
        case 'GET':
            // Fetch newsletter subscriptions with optional select and where parameters
            try {
                const { select, where } = query;
                const subscriptions = await prisma.newsletterSubscription.findMany({
                    select: select ? JSON.parse(select as string) : undefined,
                    where: where ? JSON.parse(where as string) : undefined,
                });
                res.status(200).json(subscriptions);
                log += `\nResponse Status: 200 OK`;
            } catch (error) {
                handleError(res, error, 'Failed to fetch newsletter subscriptions');
            }
            break;

        case 'POST':
            // Create a new newsletter subscription
            const { email, subscribed, user_ip } = body;

            const emailError = validateInput(email, 'string');
            const subscribedError = validateInput(subscribed, 'boolean');

            if (emailError || subscribedError) {
                log += `\nResponse Status: 400 ${emailError || subscribedError}`;
                logger.info(log);
                return res.status(400).json({ error: emailError || subscribedError });
            }

            try {
                const newSubscription = await prisma.newsletterSubscription.create({
                    data: {
                        email,
                        subscribed,
                        user_ip: user_ip || '',
                    },
                });
                res.status(201).json(newSubscription);
                await res.revalidate('/newsletter-subscriptions');
                log += `\nResponse Status: 201 Created`;
            } catch (error) {
                handleError(res, error, 'Failed to create newsletter subscription');
            }
            break;

        case 'PUT':
            // Update a newsletter subscription by ID
            const { id, newEmail, newSubscribed, newUserIp } = body;

            const idError = validateInput(id, 'id');
            const newEmailError = validateInput(newEmail, 'string');
            const newSubscribedError = validateInput(newSubscribed, 'boolean');

            if (idError || newEmailError || newSubscribedError) {
                log += `\nResponse Status: 400 ${idError || newEmailError || newSubscribedError}`;
                logger.info(log);
                return res.status(400).json({ error: idError || newEmailError || newSubscribedError });
            }

            try {
                const updatedSubscription = await prisma.newsletterSubscription.update({
                    where: { id: Number(id) },
                    data: {
                        email: newEmail,
                        subscribed: newSubscribed,
                        user_ip: newUserIp || '',
                    },
                });
                res.status(200).json(updatedSubscription);
                await res.revalidate('/newsletter-subscriptions');
                log += `\nResponse Status: 200 OK`;
            } catch (error) {
                handleError(res, error, 'Failed to update newsletter subscription');
            }
            break;

        case 'DELETE':
            // Delete a newsletter subscription by ID
            const { deleteId } = body;

            const deleteIdError = validateInput(deleteId, 'id');

            if (deleteIdError) {
                log += `\nResponse Status: 400 ${deleteIdError}`;
                logger.info(log);
                return res.status(400).json({ error: deleteIdError });
            }

            try {
                const deletedSubscription = await prisma.newsletterSubscription.delete({
                    where: { id: Number(deleteId) },
                });
                res.status(200).json(deletedSubscription);
                await res.revalidate('/newsletter-subscriptions');
                log += `\nResponse Status: 200 OK`;
            } catch (error) {
                handleError(res, error, 'Failed to delete newsletter subscription');
            }
            break;

        default:
            res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
            log += `\nResponse Status: 405 Method ${method} Not Allowed`;
            res.status(405).end(`Method ${method} Not Allowed`);
    }

    logger.info(log);
}


export default function securedHandler(req: NextApiRequest, res: NextApiResponse) {
    return authMiddleware(req, res, handler);
}