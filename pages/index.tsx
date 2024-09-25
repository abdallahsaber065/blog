import { PrismaClient } from '@prisma/client';
import HomeCoverSection from "@/components/Home/HomeCoverSection";
import FeaturedPosts from "@/components/Home/FeaturedPosts";
import RecentPosts from "@/components/Home/RecentPosts";
import { GetServerSideProps } from 'next';

const prisma = new PrismaClient();

export const getServerSideProps: GetServerSideProps = async () => {
  const allBlogs = await prisma.post.findMany({
    include: {
      tags: true,
    },
    orderBy: {
      published_at: 'desc',
    },
    take: 10,
  });

  // Convert Date objects to strings for serialization
  const serializedBlogs = allBlogs.map(blog => ({
    ...blog,
    created_at: blog.created_at.toISOString(),
    updated_at: blog.updated_at.toISOString(),
    published_at: blog.published_at ? blog.published_at.toISOString() : null,
  }));

  return {
    props: {
      allBlogs: serializedBlogs,
    },
  };
};

const Home = ({ allBlogs }: { allBlogs: any[] }) => {
  // Convert strings back to Date objects
  const deserializedBlogs = allBlogs.map(blog => ({
    ...blog,
    created_at: new Date(blog.created_at),
    updated_at: new Date(blog.updated_at),
    published_at: blog.published_at ? new Date(blog.published_at) : null,
  }));

  return (
    <main className="flex flex-col items-center justify-center">
      <HomeCoverSection posts={deserializedBlogs} />
      <FeaturedPosts posts={deserializedBlogs} />
      <RecentPosts posts={deserializedBlogs} />
    </main>
  );
};

export default Home;