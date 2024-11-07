import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { authMiddleware } from '@/middleware/authMiddleware';

async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    const { imagePath } = req.query;

    if (!imagePath || typeof imagePath !== 'string') {
        res.status(400).json({ error: 'Image path is required' });
        return;
    }

    const fullPath = path.join(process.cwd(), 'public/', imagePath);
    console.log("fullPath", fullPath);

    if (!fs.existsSync(fullPath)) {
        res.status(404).json({ error: 'Image not found' });
        return;
    }

    const imageBuffer = fs.readFileSync(fullPath);
    const ext = path.extname(fullPath).substring(1);

    // Generate an ETag for the image
    const etag = crypto.createHash('md5').update(new Uint8Array(imageBuffer)).digest('hex');

    // Set cache headers
    res.setHeader('Cache-Control', 'public, max-age=864000, immutable');
    res.setHeader('ETag', etag);

    // Check if the client's cached version is still valid
    if (req.headers['if-none-match'] === etag) {
        res.status(304).end();
        return;
    }

    res.setHeader('Content-Type', `image/${ext}`);
    res.send(imageBuffer);
}

export default function securedHandler(req: NextApiRequest, res: NextApiResponse) {
    return authMiddleware(req, res, handler);
}