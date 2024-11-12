// pages/api/auth/request-verification.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { sendEmail } from '@/lib/email';
import createEmailConfirmationForm from '@/lib/html_forms/EmailConfirmationForm';
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

        if (user.email_verified) {
            res.status(400).json({ error: 'Email already verified' });
            return 
        }

        const verificationToken = crypto.randomBytes(32).toString('hex');

        await prisma.user.update({
            where: { id: user.id },
            data: { verification_token: verificationToken },
        });

        const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/verify-email?token=${verificationToken}`;

        const htmlContent = createEmailConfirmationForm(verificationUrl, user?.first_name ?? '', user.email);

        await sendEmail(email, 'Verify your email', htmlContent);

        res.status(200).json({ message: 'Verification email sent successfully' });
    } catch (error) {
        console.error('Internal server error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}


export default function securedHandler(req: NextApiRequest, res: NextApiResponse) {
    return authMiddleware(req, res, handler);
}