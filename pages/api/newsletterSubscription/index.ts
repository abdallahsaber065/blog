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
    } else if (type === 'boolean') {
        if (typeof input !== 'boolean') {
            return 'Invalid boolean';
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
            // Fetch newsletter subscriptions with optional select and where parameters
            try {
                const { select, where } = req.query;
                const subscriptions = await prisma.newsletterSubscription.findMany({
                    select: select ? JSON.parse(select as string) : undefined,
                    where: where ? JSON.parse(where as string) : undefined,
                });
                res.status(200).json(subscriptions);
            } catch (error) {
                handleError(res, error, 'Failed to fetch newsletter subscriptions');
            }
            break;

        case 'POST':
            // Create a new newsletter subscription
            const { email, subscribed, user_ip } = req.body;

            const emailError = validateInput(email, 'string');
            const subscribedError = validateInput(subscribed, 'boolean');

            if (emailError || subscribedError) {
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
            } catch (error) {
                handleError(res, error, 'Failed to create newsletter subscription');
            }
            break;

        case 'PUT':
            // Update a newsletter subscription by ID
            const { id, newEmail, newSubscribed, newUserIp } = req.body;

            const idError = validateInput(id, 'id');
            const newEmailError = validateInput(newEmail, 'string');
            const newSubscribedError = validateInput(newSubscribed, 'boolean');

            if (idError || newEmailError || newSubscribedError) {
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
            } catch (error) {
                handleError(res, error, 'Failed to update newsletter subscription');
            }
            break;

        case 'DELETE':
            // Delete a newsletter subscription by ID
            const { deleteId } = req.body;

            const deleteIdError = validateInput(deleteId, 'id');

            if (deleteIdError) {
                return res.status(400).json({ error: deleteIdError });
            }

            try {
                const deletedSubscription = await prisma.newsletterSubscription.delete({
                    where: { id: Number(deleteId) },
                });
                res.status(200).json(deletedSubscription);
                await res.revalidate('/newsletter-subscriptions');
            } catch (error) {
                handleError(res, error, 'Failed to delete newsletter subscription');
            }
            break;

        default:
            res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
            res.status(405).end(`Method ${method} Not Allowed`);
    }
}