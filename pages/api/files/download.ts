import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { prisma } from '@/lib/prisma';
import { resolvePublicUrl, isCloudProvider } from '@/lib/storage';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { file_url_name } = req.query;

    if (!file_url_name || Array.isArray(file_url_name)) {
        return res.status(400).json({ error: 'Invalid file URL name' });
    }

    try {
        const fileRecord = await prisma.fileLibrary.findFirst({
            where: { file_url: { endsWith: file_url_name as string } },
        });

        if (!fileRecord) {
            return res.status(404).json({ error: 'File not found' });
        }

        // Handle Cloud Storage (ImageKit/S3) - Redirect to the public URL
        if (isCloudProvider()) {
            const publicUrl = resolvePublicUrl(fileRecord.file_url);
            return res.redirect(publicUrl);
        }

        // Handle Local Storage
        const filePath = path.join(process.cwd(), 'public', fileRecord.file_url);

        if (!fs.existsSync(filePath)) {
            // Check if it exists in the temp directory (for recent uploads not yet migrated or stuck)
            const tempPath = path.join(os.tmpdir(), 'uploads-temp', path.basename(fileRecord.file_url));
            if (fs.existsSync(tempPath)) {
                return sendFile(res, tempPath, fileRecord, req.method);
            }
            return res.status(404).json({ error: 'File not found on server' });
        }

        return sendFile(res, filePath, fileRecord, req.method);
    } catch (error) {
        console.error('Error downloading file:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

function sendFile(res: NextApiResponse, filePath: string, fileRecord: any, method: string) {
    res.setHeader('Content-Disposition', `attachment; filename="${fileRecord.file_name}"`);
    res.setHeader('Content-Type', fileRecord.file_type || 'application/octet-stream');
    res.setHeader('Content-Length', fileRecord.file_size.toString());
    res.setHeader('File-Id', fileRecord.id.toString());
    res.setHeader('File-Name', fileRecord.file_name);
    res.setHeader('File-Url', fileRecord.file_url);
    res.setHeader('File-Type', fileRecord.file_type);
    res.setHeader('File-Size', fileRecord.file_size.toString());

    if (method === 'HEAD') {
        return res.status(200).end();
    }

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    fileStream.on('error', (error) => {
        console.error('Error streaming file:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    });
}