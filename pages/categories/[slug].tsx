import { prisma } from '@/lib/prisma';
import BlogLayoutThree from "@/components/Blog/BlogLayoutThree";
import Categories from "@/components/Blog/Categories";
import { GetStaticProps, GetStaticPaths } from 'next';

export const getStaticPaths: GetStaticPaths = async () => {
  const tags = await prisma.tag.findMany();
  const paths = tags.map(tag => ({
    params: { slug: tag.slug },
  }));

  // Include a path for "all" categories
  paths.push({ params: { slug: 'all' } });

  return {
    paths,
    fallback: 'blocking', // Generate pages on-demand if not generated at build time
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params as { slug: string };

  const posts = await prisma.post.findMany({
    where: {
      status: "published",
    },
    select: {
      slug: true,
      title: true,
      created_at: true,
      updated_at: true,
      published_at: true,
      featured_image_url: true,
      tags: true,
    },
  });

  const allCategories = await prisma.tag.findMany();
  const filteredBlogs = posts.filter(post => {
    if (slug === "all") {
      return true;
    }
    return post.tags.some(tag => tag.slug === slug);
  });

  // Convert Date objects to strings for serialization
  const serializedPosts = filteredBlogs.map(post => ({
    ...post,
    created_at: post.created_at.toISOString(),
    updated_at: post.updated_at.toISOString(),
    published_at: post.published_at ? post.published_at.toISOString() : null,
  }));

  return {
    props: {
      slug,
      posts: serializedPosts,
      categories: allCategories,
    },
    revalidate: 3600, // Revalidate every hour
  };
};

const CategoryPage = ({ slug, posts, categories }: { slug: string, posts: any[], categories: any[] }) => {
  // Convert strings back to Date objects
  const deserializedPosts = posts.map(post => ({
    ...post,
    created_at: new Date(post.created_at),
    updated_at: new Date(post.updated_at),
    published_at: post.published_at ? new Date(post.published_at) : null,
  }));

  return (
    <article className="mt-12 flex flex-col text-dark dark:text-light">
      <div className=" px-5 sm:px-10  md:px-24  sxl:px-32 flex flex-col">
        <h1 className="mt-6 font-semibold text-2xl md:text-4xl lg:text-5xl">#{slug}</h1>
        <span className="mt-2 inline-block">
          Discover more categories and expand your knowledge!
        </span>
      </div>
      <Categories categories={categories} currentSlug={slug} />

      <div className="grid  grid-cols-1 sm:grid-cols-2  lg:grid-cols-3 grid-rows-2 gap-16 mt-5 sm:mt-10 md:mt-24 sxl:mt-32 px-5 sm:px-10 md:px-24 sxl:px-32">
        {deserializedPosts.map((post, index) => (
          <article key={index} className="col-span-1 row-span-1 relative">
            <BlogLayoutThree post={post} />
          </article>
        ))}
      </div>
    </article>
  );
};

export default CategoryPage;