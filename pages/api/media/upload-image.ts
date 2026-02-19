// pages/api/media/upload-image.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { Formidable } from 'formidable';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { prisma } from '@/lib/prisma';
import { authMiddleware } from '@/middleware/authMiddleware';
import { getStorageProvider } from '@/lib/storage';

export const config = {
  api: {
    bodyParser: false,
  },
};

// Temp dir for formidable to park the file before we stream it to storage
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
    maxFileSize: 5 * 1024 * 1024, // 5 MB
  });

  let fields: any;
  let files: any;
  try {
    [fields, files] = await new Promise<[any, any]>((resolve, reject) => {
      form.parse(req, (err, f, fi) => {
        if (err) reject(err);
        else resolve([f, fi]);
      });
    });
  } catch {
    return res.status(500).json({ error: 'Error parsing the files' });
  }

  const userId = Array.isArray(fields.userId) ? fields.userId[0] : fields.userId;
  const file = Array.isArray(files.file) ? files.file[0] : files.file;
  const saveDir = Array.isArray(fields.saveDir) ? fields.saveDir[0] : fields.saveDir;

  if (!saveDir) {
    return res.status(400).json({ error: 'Save directory is required' });
  }
  if (!userId || !file) {
    return res.status(400).json({ error: 'User ID and file are required' });
  }

  try {
    // Read temp file into a buffer
    const buffer = fs.readFileSync(file.filepath);

    // Get image dimensions
    const metadata = await sharp(buffer).metadata();
    const { width, height } = metadata;

    // Build the storage key: "uploads/<saveDir>/<filename>"
    // saveDir is 'media' for blog images, 'avatars' for profile images
    // Use originalFilename to preserve meaningful names, ImageKit handles uniqueness
    const originalName = file.originalFilename?.replace(/[^a-zA-Z0-9.-]/g, '_') || file.newFilename;
    const storageKey = `uploads/${saveDir}/${originalName}`;

    const storage = getStorageProvider();
    const uploadResult = await storage.upload(
      buffer,
      storageKey,
      file.mimetype || 'application/octet-stream',
    );

    // Clean up temp file
    try { fs.unlinkSync(file.filepath); } catch { /* ignore */ }

    // Persist metadata in DB - store the key, not the full URL
    const mediaEntry = await prisma.mediaLibrary.create({
      data: {
        file_name: uploadResult.file_name,
        file_type: uploadResult.file_type,
        file_size: uploadResult.file_size,
        file_url: uploadResult.file_url,   // e.g. "uploads/media/abc.webp"
        width: width ?? null,
        height: height ?? null,
        uploaded_by_id: parseInt(userId, 10),
      },
    });

    return res.status(200).json({
      message: 'Profile image updated successfully',
      media: {
        ...mediaEntry,
        public_url: uploadResult.public_url, // absolute URL, ready to use immediately
      },
    });
  } catch (error) {
    console.error('[upload-image]', error);
    return res.status(500).json({ error: 'Error uploading image' });
  }
}

export default function securedHandler(req: NextApiRequest, res: NextApiResponse) {
  return authMiddleware(req, res, handler);
}