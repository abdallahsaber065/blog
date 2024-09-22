import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    switch (req.method) {
        case 'GET':
            const categories = await prisma.post.findMany();
            res.status(200).json(categories);
            break;
        case 'POST':
            const newCategory = await prisma.post.create({
                data: req.body,
            });
            res.status(201).json(newCategory);
            break;
        case 'PUT':
            const { id, data } = req.body;
            const updatedCategory = await prisma.post.update({
                where: { id },
                data,
            });
            res.status(200).json(updatedCategory);
            break;
        case 'DELETE':
            await prisma.post.deleteMany(); // Delete all data
            res.status(200).json({ message: 'All data deleted' });
            break;
        default:
            res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}