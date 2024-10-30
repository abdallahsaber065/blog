// pages/api/serializeContent.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { serialize } from 'next-mdx-remote/serialize';
import { Options } from '@/lib/articles/mdxconfig';
import { SerializeOptions } from 'next-mdx-remote/dist/types';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { content } = req.body;
        if (!content) {
            return res.status(400).json({ error: 'Content is required' });
        }

        try {
            const mdxSource = await serialize(content, Options as SerializeOptions);
            return res.status(200).json({ mdxSource });
        } catch (error : any) {
            return res.status(500).json({ error: 'Failed to serialize content: ' + error.message });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}