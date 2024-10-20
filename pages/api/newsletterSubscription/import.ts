import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

// Define a type for valid subscriptions
type ValidSubscription = {
    email: string;
    subscribed: boolean;
    user_ip: string;
};

// Utility function to validate input
const validateInput = (input: any, type: string): string | null => {
    if (type === 'string') {
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
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const { data } = req.body;

    if (!data || !Array.isArray(data)) {
        return res.status(400).json({ error: 'Invalid data' });
    }

    const subscriptions = data.map((item: any) => {
        const emailError = validateInput(item.email, 'string');
        const subscribedError = validateInput(item.subscribed, 'boolean');

        if (emailError || subscribedError) {
            return { error: emailError || subscribedError };
        }

        return {
            email: item.email,
            subscribed: item.subscribed,
            user_ip: item.user_ip || '00.00.11.22',
        } as ValidSubscription;
    });

    const validSubscriptions = subscriptions.filter((sub: any) => !sub.error) as ValidSubscription[];
    const invalidSubscriptions = subscriptions.filter((sub: any) => sub.error);
    if (invalidSubscriptions.length > 0) {
        return res.status(400).json({ error: 'Invalid data in CSV', details: invalidSubscriptions });
    }

    try {
        const createdSubscriptions = await prisma.newsletterSubscription.createMany({
            data: validSubscriptions,
            skipDuplicates: true,
        });
        res.status(201).json(createdSubscriptions);
    } catch (error) {
        handleError(res, error, 'Failed to import newsletter subscriptions');
    }
}