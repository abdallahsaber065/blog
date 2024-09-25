// pages/api/contact.ts
import { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';
import { check, validationResult } from 'express-validator';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
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

        res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ error: 'Failed to send email' });
    }
}