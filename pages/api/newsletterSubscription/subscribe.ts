import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import logger from '@/lib/logger';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method, body } = req;

    let log = `\n${method} /api/subscribe\nBody: ${JSON.stringify(body, null, 2)}`;

    if (method === 'POST') {
        const { email } = body;
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipResponse.json();
        const ip = ipData.ip;

        logger.info(`Email: ${email}\nIP: ${ip}`);

        if (!email) {
            log += `\nResponse Status: 400 Email is required`;
            logger.info(log);
            return res.status(400).json({ error: 'Email is required' });
        }

        try {
            // Check if the email already exists
            const existingSubscription = await prisma.newsletterSubscription.findUnique({
                where: { email },
            });

            if (existingSubscription) {
                log += `\nResponse Status: 400 Email is already subscribed`;
                logger.info(log);
                return res.status(400).json({ error: 'Email is already subscribed' });
            }

            // Create a new subscription
            const newSubscription = await prisma.newsletterSubscription.create({
                data: {
                    email: email,
                    user_ip: ip,
                }
            });

            log += `\nResponse Status: 200 Subscribed successfully`;
            logger.info(log);
            return res.status(200).json({ message: 'Subscribed successfully' });
        } catch (error: any) {
            logger.error(`Internal server error: ${error.message}`);
            log += `\nResponse Status: 500 Internal server error`;
            logger.info(log);
            return res.status(500).json({ error: 'Internal server error' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        log += `\nResponse Status: 405 Method ${method} Not Allowed`;
        logger.info(log);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
}