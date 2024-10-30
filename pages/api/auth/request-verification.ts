// pages/api/auth/request-verification.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { sendEmail } from '@/lib/email';
import siteMetadata from '@/lib/siteMetaData';

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

        const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/verify-email?token=${verificationToken}`;

        const htmlContent = `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <div style="text-align: center;">
                    <img src="${siteMetadata.siteUrl}static/images/logo.png" alt="${siteMetadata.title}" style="width: 100px; height: auto;">
                </div>
                <h2 style="text-align: center;">Verify your email</h2>
                <p>Hi,</p>
                <p>Thank you for registering at ${siteMetadata.title}. Please verify your email by clicking the link below:</p>
                <p style="text-align: center;">
                    <a href="${verificationUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>
                </p>
                <p>If the button above doesn't work, please copy and paste the following URL into your web browser:</p>
                <p><a href="${verificationUrl}">${verificationUrl}</a></p>
                <p>Best regards,<br>${siteMetadata.author}</p>
                <hr>
                <p style="text-align: center;">
                    <a href="${siteMetadata.siteUrl}">${siteMetadata.siteUrl}</a> | 
                    <a href="${siteMetadata.github}">GitHub</a> | 
                    <a href="${siteMetadata.twitter}">Twitter</a> | 
                    <a href="${siteMetadata.linkedin}">LinkedIn</a>
                </p>
            </div>
        `;
        const textContent = `Verify your email by clicking the link below:\n\n${verificationUrl}`;

        await sendEmail(email, 'Verify your email', htmlContent, textContent);

        res.status(200).json({ message: 'Verification email sent successfully' });
    } catch (error) {
        console.error('Internal server error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}