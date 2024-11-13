// pages/api/files/upload.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { Formidable } from 'formidable';
import fs from 'fs';
import path from 'path';
import { prisma } from '@/lib/prisma';
import { authMiddleware } from '@/middleware/authMiddleware';

export const config = {
    api: {
        bodyParser: false,
    },
};

const uploadDir = path.join(process.cwd(), 'public/uploads/files');

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
        maxFileSize: 10 * 1024 * 1024, // 10MB
    });

    form.parse(req, async (err, fields, files) => {
        if (err) {
            return res.status(500).json({ error: 'Error parsing the files' });
        }

        const userId = Array.isArray(fields.userId) ? fields.userId[0] : fields.userId;
        const file = Array.isArray(files.file) ? files.file[0] : files.file;
        const saveDir = Array.isArray(fields.saveDir) ? fields.saveDir[0] : fields.saveDir;

        if (!saveDir) {
            return res.status(400).json({ error: 'Save directory is required' });
        }
        const saveDirPath = path.join(process.cwd(), 'public/uploads', saveDir);
        const localFileUploadPath = path.join('uploads', saveDir);

        if (!fs.existsSync(saveDirPath)) {
            fs.mkdirSync(saveDirPath, { recursive: true });
        }

        if (!file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        const localFilePath = path.join(localFileUploadPath, file.newFilename);

        try {
            const fileEntry = await prisma.fileLibrary.create({
                data: {
                    file_name: file.originalFilename || file.newFilename,
                    file_type: file.mimetype || '',
                    file_size: file.size,
                    file_url: localFilePath,
                    uploaded_by_id: userId ? parseInt(userId, 10) : null,
                },
            });

            fs.renameSync(file.filepath, path.join(saveDirPath, file.newFilename));
            return res.status(200).json({ message: 'File uploaded successfully', file: fileEntry });
        } catch (error) {
            return res.status(500).json({ error: 'Error saving file' });
        }
    });
}

export default function securedHandler(req: NextApiRequest, res: NextApiResponse) {
    return authMiddleware(req, res, handler);
}