import { prisma } from "@/lib/prisma";
import { GetStaticProps } from 'next';
import Head from 'next/head';
import Hero from "@/components/Home/Hero";
import BlogList from "@/components/Home/BlogList";

export const getStaticProps: GetStaticProps = async () => {
  const selectQuery = {
    id: true,
    slug: true,
    title: true,
    excerpt: true,
    created_at: true,
    updated_at: true,
    published_at: true,
    featured_image_url: true,
    tags: {
      select: { name: true, slug: true }
    },
    category: {
      select: { name: true, slug: true }
    },
  };

  let featuredBlogs = await prisma.post.findMany({
    where: { status: 'published', is_featured: true },
    orderBy: { published_at: 'desc' },
    select: selectQuery,
    take: 3,
  });

  const featuredIds = featuredBlogs.map(b => b.id);

  if (featuredBlogs.length < 3) {
    const backfill = await prisma.post.findMany({
      where: { status: 'published', id: { notIn: featuredIds } },
      orderBy: { published_at: 'desc' },
      select: selectQuery,
      take: 3 - featuredBlogs.length,
    });
    featuredBlogs = [...featuredBlogs, ...backfill];
  }

  const recentBlogs = await prisma.post.findMany({
    where: { status: 'published', id: { notIn: featuredBlogs.map(b => b.id) } },
    orderBy: { published_at: 'desc' },
    select: selectQuery,
    take: 10,
  });

  const serializeDate = (date: Date | null | undefined) => date ? date.toISOString() : null;

  const serializedFeatured = featuredBlogs.map(blog => ({
    ...blog,
    created_at: serializeDate(blog.created_at),
    updated_at: serializeDate(blog.updated_at),
    published_at: serializeDate(blog.published_at),
  }));

  const serializedRecent = recentBlogs.map(blog => ({
    ...blog,
    created_at: serializeDate(blog.created_at),
    updated_at: serializeDate(blog.updated_at),
    published_at: serializeDate(blog.published_at),
  }));

  return {
    props: {
      featuredBlogs: serializedFeatured,
      recentBlogs: serializedRecent
    },
    revalidate: 60
  };
};

const Home = ({ featuredBlogs, recentBlogs }: { featuredBlogs: any[], recentBlogs: any[] }) => {
  const deserializeDates = (blogs: any[]) => blogs.map(blog => ({
    ...blog,
    created_at: new Date(blog.created_at),
    updated_at: new Date(blog.updated_at),
    published_at: blog.published_at ? new Date(blog.published_at) : null,
  }));

  const deserializedFeatured = deserializeDates(featuredBlogs);
  const deserializedRecent = deserializeDates(recentBlogs);

  const heroPost = deserializedFeatured.length > 0 ? deserializedFeatured[0] : null;
  const remainingFeatured = deserializedFeatured.slice(1);

  return (
    <>
      <Head>
        <title>DevTrend | Modern Tech Insights</title>
        <meta name="description" content="A modern blog featuring the latest in tech, development, and design." />
      </Head>

      <main className="flex flex-col min-h-screen bg-dark w-full overflow-x-hidden">
        {!heroPost && deserializedRecent.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-screen">
            <h1 className="text-4xl font-display font-bold text-light mb-4">Coming Soon</h1>
            <p className="text-light/60 font-inter text-lg">We are preparing some amazing content for you.</p>
          </div>
        ) : (
          <>
            {heroPost && <Hero post={heroPost} />}

            {remainingFeatured.length > 0 && (
              <BlogList
                title="Featured Stories"
                description="Our most impactful and essential reads."
                posts={remainingFeatured}
                highlightFirst={true}
              />
            )}

            {deserializedRecent.length > 0 && (
              <BlogList
                title="Latest Posts"
                description="Catch up on the newest insights and tutorials."
                posts={deserializedRecent}
              />
            )}
          </>
        )}
      </main>
    </>
  );
};

export default Home;