import { PrismaClient } from '@prisma/client';
import HomeCoverSection from "@/components/Home/HomeCoverSection";
import FeaturedPosts from "@/components/Home/FeaturedPosts";
import RecentPosts from "@/components/Home/RecentPosts";

const prisma = new PrismaClient();

export default async function Home() {
  const allBlogs = await prisma.post.findMany({
    include: {
      tags: true,
    },
  });

  return (
    <main className="flex flex-col items-center justify-center">
      <HomeCoverSection posts={allBlogs} />
      <FeaturedPosts posts={allBlogs} />
      <RecentPosts posts={allBlogs} />
    </main>
  );
}