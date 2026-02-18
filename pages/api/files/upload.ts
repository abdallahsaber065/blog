// pages/api/files/upload.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { Formidable } from 'formidable';
import fs from 'fs';
import path from 'path';
import { prisma } from '@/lib/prisma';
import { authMiddleware } from '@/middleware/authMiddleware';
import { getStorageProvider } from '@/lib/storage';

export const config = {
  api: {
    bodyParser: false,
  },
};

const tempDir = path.join(process.cwd(), 'public/uploads/temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const form = new Formidable({
    uploadDir: tempDir,
    keepExtensions: true,
    maxFileSize: 10 * 1024 * 1024, // 10 MB
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
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
      const buffer = fs.readFileSync(file.filepath);
      const originalName = file.originalFilename || file.newFilename;
      const storageKey = `uploads/${saveDir}/${file.newFilename}`;

      const storage = getStorageProvider();
      const uploadResult = await storage.upload(
        buffer,
        storageKey,
        file.mimetype || 'application/octet-stream',
      );

      // Clean up temp file
      try { fs.unlinkSync(file.filepath); } catch { /* ignore */ }

      const fileEntry = await prisma.fileLibrary.create({
        data: {
          file_name: originalName,
          file_type: uploadResult.file_type,
          file_size: uploadResult.file_size,
          file_url: uploadResult.file_url,   // e.g. "uploads/files/doc.pdf"
          uploaded_by_id: userId ? parseInt(userId, 10) : null,
        },
      });

      return res.status(200).json({
        message: 'File uploaded successfully',
        file: {
          ...fileEntry,
          public_url: uploadResult.public_url,
        },
      });
    } catch (error) {
      console.error('[files/upload]', error);
      return res.status(500).json({ error: 'Error saving file' });
    }
  });
}

export default function securedHandler(req: NextApiRequest, res: NextApiResponse) {
  return authMiddleware(req, res, handler);
}