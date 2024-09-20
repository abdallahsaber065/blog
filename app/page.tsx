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

  // Ensure all image paths start with a leading slash and are relative to the public directory
  // replace public and all before content with /
  const updatedBlogs = allBlogs.map(blog => ({
    ...blog,
    featured_image_url: blog.featured_image_url?.startsWith('http')
      ? blog.featured_image_url
      : `${blog.featured_image_url?.replace("../../public", "")}`,
  }));

  return (
    <main className="flex flex-col items-center justify-center">
      <HomeCoverSection posts={updatedBlogs} />
      <FeaturedPosts posts={updatedBlogs} />
      <RecentPosts posts={updatedBlogs} />
    </main>
  );
}