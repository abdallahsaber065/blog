// pages/api/contact.ts
import { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';
import { check, validationResult } from 'express-validator';
import logger from '@/lib/logger';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method, body } = req;

    // Log query and body if body is present
    let log = `\n${method} /api/contact\nRequest: ${JSON.stringify({ body: { ...body, email: '***' } }, null, 2)}`;

    if (method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        log += `\nResponse Status: 405 Method ${method} Not Allowed`;
        logger.info(log);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }

    // Define validation rules
    await Promise.all([
        check('name').notEmpty().withMessage('Name is required').run(req),
        check('email').isEmail().withMessage('Valid email is required').run(req),
        check('message').notEmpty().withMessage('Message is required').run(req)
    ]);

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        log += `\nResponse Status: 400 Validation errors: ${JSON.stringify(errors.array(), null, 2)}`;
        logger.info(log);
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, message } = req.body;

    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.mailgun.org',
            port: 587,
            auth: {
                user: process.env.MAILGUN_USER,
                pass: process.env.MAILGUN_PASS,
            },
        });

        await transporter.sendMail({
            from: email,
            to: 'support@devtrend.tech',
            subject: `Contact Form Submission from ${name}`,
            text: message,
        });

        log += `\nResponse Status: 200 Email sent successfully`;
        logger.info(log);
        res.status(200).json({ message: 'Email sent successfully' });
    } catch (error: any) {
        logger.error(`Error sending email: ${error.message}`);
        log += `\nResponse Status: 500 Failed to send email`;
        logger.info(log);
        res.status(500).json({ error: 'Failed to send email' });
    }
}