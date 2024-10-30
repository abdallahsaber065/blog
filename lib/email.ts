// lib/email.ts
import nodemailer from 'nodemailer';
import siteMetadata from '@/lib/siteMetaData';

const transporter = nodemailer.createTransport({
    host: 'smtp.mailgun.org',
    port: 587,
    auth: {
        user: process.env.MAILGUN_USER,
        pass: process.env.MAILGUN_PASS,
    },
});

export async function sendEmail(to: string, subject: string, htmlContent: string, textContent: string = "") {
    try {
        await transporter.sendMail({
            from: siteMetadata.email,
            to,
            subject,
            html: htmlContent,
            alternatives: [{ contentType: 'text/plain', content: textContent }],
        });
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Error sending email');
    }
}