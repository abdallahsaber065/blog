// pages/api/subscribe.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { email } = req.body;

    try {
      await prisma.newsletterSubscription.create({
        data: { email },
      });
      res.status(200).json({ message: 'Subscribed successfully!' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Subscription failed. Please try again.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}