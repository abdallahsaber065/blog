import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { apiError, methodNotAllowed } from '@/lib/apiError';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method, body } = req;

    let log = `\n${method} /api/subscribe\nBody: ${JSON.stringify(body, null, 2)}`;

    if (method === 'POST') {
        const { email } = body;

        if (!email) {
            log += `\nResponse Status: 400 Email is required`;
            return apiError(res, 400, 'Email is required');
        }

        // Attempt to retrieve the subscriber's IP — degrade gracefully if the lookup fails
        let ip = 'unknown';
        try {
            const ipResponse = await fetch('https://api.ipify.org?format=json');
            if (ipResponse.ok) {
                const ipData = await ipResponse.json();
                ip = ipData.ip ?? 'unknown';
            }
        } catch {
            console.warn('subscribe.ts: IP lookup failed, using "unknown"');
        }

        try {
            // Check if the email already exists
            const existingSubscription = await prisma.newsletterSubscription.findUnique({
                where: { email },
            });

            if (existingSubscription) {
                log += `\nResponse Status: 400 Email is already subscribed`;
                return apiError(res, 400, 'Email is already subscribed');
            }

            // Create a new subscription
            await prisma.newsletterSubscription.create({
                data: {
                    email: email,
                    user_ip: ip,
                }
            });

            log += `\nResponse Status: 200 Subscribed successfully`;
            return res.status(200).json({ message: 'Subscribed successfully' });
        } catch (error: any) {
            log += `\nResponse Status: 500 Internal server error`;
            console.error('subscribe.ts error:', error);
            return apiError(res, 500, 'Internal server error');
        }
    } else {
        return methodNotAllowed(res, ['POST']);
    }
}
