// pages/api/auth/request-password-reset.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { sendEmail } from '@/lib/email';
import createPasswordResetForm from '@/lib/html_forms/PasswordResetForm';
import { authMiddleware } from '@/middleware/authMiddleware';

async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;

    if (method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${method} Not Allowed`);
        return
    }

    const { email } = req.body;

    if (!email || typeof email !== 'string') {
        res.status(400).json({ error: 'Invalid email' });
        return
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            res.status(400).json({ error: 'User not found' });
            return
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour

        await prisma.user.update({
            where: { id: user.id },
            data: { reset_token: resetToken, reset_token_expires: resetTokenExpires },
        });

        const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/reset-password?token=${resetToken}`;

        const htmlContent = createPasswordResetForm(resetUrl, user?.first_name ?? '', user.email);
        const textContent = `Reset your password by clicking the link below:\n\n${resetUrl}`;

        await sendEmail(email, 'Reset your password', htmlContent, textContent);

        res.status(200).json({ message: 'Password reset email sent successfully' });
    } catch (error) {
        console.error('Internal server error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export default function securedHandler(req: NextApiRequest, res: NextApiResponse) {
    return authMiddleware(req, res, handler);
}