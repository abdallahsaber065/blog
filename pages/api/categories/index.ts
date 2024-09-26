import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    switch (req.method) {
        case 'GET':
            const categories = await prisma.category.findMany();
            res.status(200).json(categories);
            break;
        case 'POST':
            const newCategory = await prisma.category.create({
                data: req.body,
            });
            res.status(201).json(newCategory);
            break;
        default:
            res.setHeader('Allow', ['GET', 'POST']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}