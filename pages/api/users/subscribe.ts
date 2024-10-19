import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    try {
      // Check if the email already exists
      const existingSubscription = await prisma.newsletterSubscription.findUnique({
        where: { email },
      });

      if (existingSubscription) {
        return res.status(400).json({ error: 'Email is already subscribed' });
      }

      // Create a new subscription
      const newSubscription = await prisma.newsletterSubscription.create({
        data: { email },
      });

      return res.status(200).json({ message: 'Subscribed successfully', subscription: newSubscription });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}