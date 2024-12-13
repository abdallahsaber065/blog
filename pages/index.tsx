import { prisma } from "@/lib/prisma";
import HomeCoverSection from "@/components/Home/HomeCoverSection";
import FeaturedPosts from "@/components/Home/FeaturedPosts";
import RecentPosts from "@/components/Home/RecentPosts";

export const getStaticProps = async () => {
  const allBlogs = await prisma.post.findMany({
    select: {
      slug: true,
      title: true,
      excerpt: true,
      created_at: true,
      updated_at: true,
      published_at: true,
      featured_image_url: true,
      tags: {
        select: {
          name: true,
          slug: true
        }
      },
      category: {
        select: {
          name: true,
          slug: true
        }
      },
    },
    where: {
      status: 'published',
    },
    orderBy: {
      published_at: 'desc',
    },
    take: 10,
  });

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
    revalidate: false
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
      {deserializedBlogs.length < 4 ? (
        <div className="flex items-center justify-center h-screen">
          <h1 className="text-4xl font-bold">Coming Soon...</h1>
        </div>
      ) : (
        <>
          <HomeCoverSection posts={deserializedBlogs} />
          <FeaturedPosts posts={deserializedBlogs} />
          <RecentPosts posts={deserializedBlogs} />
        </>
      )}
    </main>
  );
};

export default Home;