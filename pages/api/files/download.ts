import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { prisma } from '@/lib/prisma';
import { authMiddleware } from '@/middleware/authMiddleware';

const cache = new Map<string, any>();

async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { file_url_name } = req.query;

    if (!file_url_name || Array.isArray(file_url_name)) {
        return res.status(400).json({ error: 'Invalid file URL name' });
    }

    try {
        // Check cache first
        if (cache.has(file_url_name as string)) {
            console.log(`Cache hit for file: ${file_url_name}`);
            const cachedFile = cache.get(file_url_name as string);
            return sendFile(res, cachedFile.filePath, cachedFile.fileRecord,req.method);
        }

        const fileRecord = await prisma.fileLibrary.findFirst({
            where: { file_url: { endsWith: file_url_name as string } },
        });

        if (!fileRecord) {
            return res.status(404).json({ error: 'File not found' });
        }

        const filePath = path.join(process.cwd(), 'public', fileRecord.file_url);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'File not found on server' });
        }

        // Cache the file metadata
        cache.set(file_url_name as string, { filePath, fileRecord });

        return sendFile(res, filePath, fileRecord,req.method);
    } catch (error) {
        console.error('Error downloading file:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

function sendFile(res: NextApiResponse, filePath: string, fileRecord: any,method: string) {
    res.setHeader('Content-Disposition', `attachment; filename="${fileRecord.file_name}"`);
    res.setHeader('Content-Type', fileRecord.file_type || 'application/octet-stream');
    res.setHeader('Content-Length', fileRecord.file_size.toString());
    res.setHeader('File-Id', fileRecord.id.toString());
    res.setHeader('File-Name', fileRecord.file_name);
    res.setHeader('File-Url', fileRecord.file_url);
    res.setHeader('File-Type', fileRecord.file_type);
    res.setHeader('File-Size', fileRecord.file_size.toString());

    if (method === 'HEAD') {
        res.status(200).end();
        return;
    }

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
}

export default function securedHandler(req: NextApiRequest, res: NextApiResponse) {
    return authMiddleware(req, res, handler);
}
