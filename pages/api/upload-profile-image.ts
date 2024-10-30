// pages/api/upload-profile-image.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { Formidable, IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';
import { prisma } from '@/lib/prisma';

export const config = {
    api: {
        bodyParser: false,
    },
};

const uploadDir = path.join(process.cwd(), 'public/uploads/profile-images');

// Ensure the upload directory exists
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const form = new Formidable({
        uploadDir,
        keepExtensions: true,
        maxFileSize: 5 * 1024 * 1024, // 5MB
    });

    form.parse(req, async (err, fields, files) => {
        if (err) {
            return res.status(500).json({ error: 'Error parsing the files' });
        }

        const userId = Array.isArray(fields.userId) ? fields.userId[0] : fields.userId;
        const file = Array.isArray(files.file) ? files.file[0] : files.file;

        if (!userId || !file) {
            return res.status(400).json({ error: 'User ID and file are required' });
        }

        const filePath = path.join(uploadDir, file.newFilename);

        try {
            // Update the user's profile image URL in the database
            const updatedUser = await prisma.user.update({
                where: { id: parseInt(userId, 10) },
                data: { profile_image_url: `/uploads/profile-images/${file.newFilename}` },
            });

            return res.status(200).json({ message: 'Profile image updated successfully', user: updatedUser });
        } catch (error) {
            return res.status(500).json({ error: 'Error updating profile image' });
        }
    });
};

export default handler;