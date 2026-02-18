// pages/api/upload-auth.ts
// Generates short-lived ImageKit upload credentials.
// Only authenticated users (via NextAuth session) can call this route.
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { options as authOptions } from '@/pages/api/auth/[...nextauth]';
import { getUploadAuthParams } from '@imagekit/next/server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Guard: only authenticated users may obtain upload credentials
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;

  if (!privateKey || !publicKey) {
    return res.status(500).json({ error: 'ImageKit API keys are not configured' });
  }

  try {
    const { token, expire, signature } = getUploadAuthParams({
      privateKey,
      publicKey,
    });

    return res.status(200).json({ token, expire, signature, publicKey });
  } catch (err) {
    console.error('[upload-auth]', err);
    return res.status(500).json({ error: 'Failed to generate upload credentials' });
  }
}
