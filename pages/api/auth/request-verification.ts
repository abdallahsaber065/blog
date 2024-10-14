// pages/api/auth/request-verification.ts
import { NextApiRequest, NextApiResponse } from 'next';
import {prisma} from '@/lib/prisma';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;

    if (method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }

    const { email } = req.body;

    if (!email || typeof email !== 'string') {
        return res.status(400).json({ error: 'Invalid email' });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return res.status(400).json({ error: 'User not found' });
        }

        if (user.email_verified) {
            return res.status(400).json({ error: 'Email already verified' });
        }

        const verificationToken = crypto.randomBytes(32).toString('hex');

        await prisma.user.update({
            where: { id: user.id },
            data: { verification_token: verificationToken },
        });

        const transporter = nodemailer.createTransport({
            host: 'smtp.mailgun.org',
            port: 587,
            auth: {
                user: process.env.MAILGUN_USER,
                pass: process.env.MAILGUN_PASS,
            },
        });

        const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/verify-email?token=${verificationToken}`;

        await transporter.sendMail({
            from: process.env.MAILGUN_USER,
            to: email,
            subject: 'Verify your email',
            text: `Please verify your email by clicking the following link: ${verificationUrl}`,
        });

        res.status(200).json({ message: 'Verification email sent successfully' });
    } catch (error) {
        console.error('Internal server error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}