// pages/api/auth/signup.ts
import { NextApiRequest, NextApiResponse } from 'next';
import {prisma} from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import formidable, { IncomingForm, Fields, Files } from 'formidable';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

interface SignupFields {
    username: string;
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    bio?: string;
} 

interface SignupFiles {
    profile_image?: formidable.File[];
}

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;

    if (method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }

    const form = new IncomingForm();

    form.parse(req, async (err, fields: Fields, files: Files) => {
        if (err) {
            console.error('Error parsing form data:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        const { username, email, password, first_name, last_name, bio } = fields as unknown as SignupFields;
        const parsedFields: SignupFields = {
            username: Array.isArray(username) ? username[0] : username,
            email: Array.isArray(email) ? email[0] : email,
            password: Array.isArray(password) ? password[0] : password,
            first_name: Array.isArray(first_name) ? first_name[0] : first_name,
            last_name: Array.isArray(last_name) ? last_name[0] : last_name,
            bio: Array.isArray(bio) ? bio[0] : bio,
        };

        const { profile_image } = files as unknown as SignupFiles;
        const profile_image_url = profile_image ? profile_image[0].filepath : null;

        if (!parsedFields.username || !parsedFields.email || !parsedFields.password) {
            return res.status(400).json({ error: 'Username, email, and password are required' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(parsedFields.email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        if (parsedFields.password.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters long' });
        }

        if (!parsedFields.first_name || !parsedFields.last_name) {
            return res.status(400).json({ error: 'First name and last name are required' });
        }

        try {
            const existingUser = await prisma.user.findFirst({
                where: {
                    OR: [
                        { email: parsedFields.email },
                        { username: parsedFields.username }
                    ]
                }
            });

            if (existingUser) {
                return res.status(400).json({ error: 'Email or username already exists' });
            }

            const hashedPassword = await bcrypt.hash(parsedFields.password, 10);
            const verificationToken = crypto.randomBytes(32).toString('hex');

            const newUser = await prisma.user.create({
                data: {
                    username: parsedFields.username,
                    email: parsedFields.email,
                    password: hashedPassword,
                    first_name: parsedFields.first_name,
                    last_name: parsedFields.last_name,
                    bio: parsedFields.bio,
                    profile_image_url,
                    verification_token: verificationToken,
                },
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
                to: parsedFields.email,
                subject: 'Verify your email',
                text: `Please verify your email by clicking the following link: ${verificationUrl}`,
            });

            res.status(201).json(newUser);
        } catch (error) {
            console.error('Internal server error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
}