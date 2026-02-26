import { prisma } from "@/lib/prisma";
import { GetStaticProps } from 'next';
import Head from 'next/head';
import Hero from "@/components/Home/Hero";
import BlogList from "@/components/Home/BlogList";

export const getStaticProps: GetStaticProps = async () => {
  // Minimal select — only fields actually rendered on the home page.
  // `tags` intentionally omitted (not displayed here).
  const selectQuery = {
    id: true,
    slug: true,
    title: true,
    excerpt: true,
    published_at: true,
    featured_image_url: true,
    category: {
      select: { name: true, slug: true },
    },
  };

  // ── Step 1: fetch featured + a generous recent pool in parallel ──────
  const [rawFeatured, rawRecent] = await Promise.all([
    prisma.post.findMany({
      where: { status: 'published', is_featured: true },
      orderBy: { published_at: 'desc' },
      select: selectQuery,
      take: 3,
    }),
    // Fetch 13 recent so we always have 10 left after excluding up to 3 featured
    prisma.post.findMany({
      where: { status: 'published' },
      orderBy: { published_at: 'desc' },
      select: selectQuery,
      take: 13,
    }),
  ]);

  // ── Step 2: backfill featured to 3 from the recent pool (no extra DB hit) ──
  let featuredBlogs = rawFeatured;
  if (featuredBlogs.length < 3) {
    const featuredIds = new Set(featuredBlogs.map(b => b.id));
    const backfill = rawRecent
      .filter(b => !featuredIds.has(b.id))
      .slice(0, 3 - featuredBlogs.length);
    featuredBlogs = [...featuredBlogs, ...backfill];
  }

  const featuredIdSet = new Set(featuredBlogs.map(b => b.id));
  const recentBlogs = rawRecent
    .filter(b => !featuredIdSet.has(b.id))
    .slice(0, 10);

  const serializeDate = (date: Date | null | undefined) => date ? date.toISOString() : null;

  const serializedFeatured = featuredBlogs.map(blog => ({
    ...blog,
    published_at: serializeDate(blog.published_at),
  }));

  const serializedRecent = recentBlogs.map(blog => ({
    ...blog,
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
    published_at: blog.published_at ? new Date(blog.published_at) : null,
  }));

  const deserializedFeatured = deserializeDates(featuredBlogs);
  const deserializedRecent = deserializeDates(recentBlogs);

  const hasContent = deserializedFeatured.length > 0 || deserializedRecent.length > 0;

  return (
    <>
      <Head>
        <title>DevTrend | Modern Tech Insights</title>
        <meta name="description" content="A modern blog featuring the latest in tech, development, and design." />
      </Head>

      <main className="flex flex-col min-h-screen bg-dark w-full overflow-x-hidden">
        {!hasContent ? (
          <div className="flex flex-col items-center justify-center min-h-screen">
            <h1 className="text-4xl font-display font-bold text-light mb-4">Coming Soon</h1>
            <p className="text-light/60 font-inter text-lg">We are preparing some amazing content for you.</p>
          </div>
        ) : (
          <>
            {/* Hero: 3 featured posts filling the viewport */}
            {deserializedFeatured.length > 0 && <Hero posts={deserializedFeatured} />}

            {/* Thin divider between sections */}
            {deserializedFeatured.length > 0 && deserializedRecent.length > 0 && (
              <div className="h-px bg-gradient-to-r from-transparent via-darkBorder to-transparent" />
            )}

            {/* Latest posts grid */}
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