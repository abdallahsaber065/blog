// pages/api/contact.ts
import { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';
import { check, validationResult } from 'express-validator';
import { apiError, methodNotAllowed } from '@/lib/apiError';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method, body } = req;

    // Log query and body if body is present
    let log = `\n${method} /api/contact\nRequest: ${JSON.stringify({ body: { ...body, email: '***' } }, null, 2)}`;

    if (method !== 'POST') {
        log += `\nResponse Status: 405 Method ${method} Not Allowed`;
        return methodNotAllowed(res, ['POST']);
    }

    // Define validation rules
    await Promise.all([
        check('name').notEmpty().withMessage('Name is required').run(req),
        check('email').isEmail().withMessage('Valid email is required').run(req),
        check('message').notEmpty().withMessage('Message is required').run(req)
    ]);

    // Check for validation errors - collapse to single { error } string
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessage = errors.array().map(e => e.msg).join('. ');
        log += `\nResponse Status: 400 Validation errors: ${errorMessage}`;
        return apiError(res, 400, errorMessage);
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

        res.status(200).json({ message: 'Email sent successfully' });
    } catch (error: any) {
        log += `\nResponse Status: 500 Failed to send email`;
        console.error('contact.ts error:', error);
        return apiError(res, 500, 'Failed to send email');
    }
}

