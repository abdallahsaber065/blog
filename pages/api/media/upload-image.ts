// pages/api/upload-image.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { Formidable, IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { prisma } from '@/lib/prisma';
import { authMiddleware } from '@/middleware/authMiddleware';

export const config = {
    api: {
        bodyParser: false,
    },
};

const uploadDir = path.join(process.cwd(), 'public/uploads/temp');

// Ensure the upload directory exists
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
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
        const saveDir = Array.isArray(fields.saveDir) ? fields.saveDir[0] : fields.saveDir;

        // make sure the saveDir exists
        if (!saveDir) {
            return res.status(400).json({ error: 'Save directory is required' });
        }
        const saveDirPath = path.join(process.cwd(), 'public/uploads', saveDir);
        const localImageUploadPath = path.join('uploads', saveDir);

        if (!fs.existsSync(saveDirPath)) {
            fs.mkdirSync(saveDirPath, { recursive: true });
        }

        if (!userId || !file) {
            return res.status(400).json({ error: 'User ID and file are required' });
        }

        const localImageFilePath = path.join(localImageUploadPath, file.newFilename);

        try {
            // Get image dimensions using sharp
            const image = sharp(file.filepath);
            const metadata = await image.metadata();
            const { width, height } = metadata;

            // Save the uploaded image to the MediaLibrary table
            const mediaEntry = await prisma.mediaLibrary.create({
                data: {
                    file_name: file.newFilename,
                    file_type: file.mimetype,
                    file_size: file.size,
                    file_url: localImageFilePath,
                    width: width || null,
                    height: height || null,
                    uploaded_by_id: parseInt(userId, 10),

                },
            });
            fs.renameSync(file.filepath, path.join(saveDirPath, file.newFilename));

            return res.status(200).json({ message: 'Profile image updated successfully', media: mediaEntry });
        } catch (error) {
            return res.status(500).json({ error: 'Error updating profile image' });
        }
    });
};

export default function securedHandler(req: NextApiRequest, res: NextApiResponse) {
    return authMiddleware(req, res, handler);
}