import { PrismaClient } from '@prisma/client';
import BlogLayoutThree from "@/components/Blog/BlogLayoutThree";
import Categories from "@/components/Blog/Categories";
import GithubSlugger from "github-slugger";

const prisma = new PrismaClient();
const slugger = new GithubSlugger();

export async function generateStaticParams() {
  const posts = await prisma.post.findMany({
    include: {
      tags: true,
    }
  });

  const categories: string[] = [];
  const paths = [{ slug: "all" }];

  posts.forEach((post) => {
    post.tags.forEach((tag) => {
      let slugified = slugger.slug(tag.name);
      if (!categories.includes(slugified)) {
        categories.push(slugified);
        paths.push({ slug: slugified });
      }
    });
  });

  return paths;
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  return {
    title: `${params.slug.replaceAll("-", " ")} Blogs`,
    description: `Learn more about ${params.slug === "all" ? "web development" : params.slug} through our collection of expert posts and tutorials`,
  };
}

const CategoryPage = async ({ params }: { params: { slug: string } }) => {
  console.log(params);
  const posts = await prisma.post.findMany(
    {
      where: {
        status: "published",
      },
      include: {
        tags: true,
      }
    }
  );

  const allCategories = await prisma.tag.findMany();
  console.log(allCategories);
  const filteredBlogs = posts.filter(post => {
    if (params.slug === "all") {
      return true;
    }
    return post.tags.some(tag => tag.slug === params.slug);
  });
  return (
    <article className="mt-12 flex flex-col text-dark dark:text-light">
      <div className=" px-5 sm:px-10  md:px-24  sxl:px-32 flex flex-col">
        <h1 className="mt-6 font-semibold text-2xl md:text-4xl lg:text-5xl">#{params.slug}</h1>
        <span className="mt-2 inline-block">
          Discover more categories and expand your knowledge!
        </span>
      </div>
      <Categories categories={allCategories} currentSlug={params.slug} />

      <div className="grid  grid-cols-1 sm:grid-cols-2  lg:grid-cols-3 grid-rows-2 gap-16 mt-5 sm:mt-10 md:mt-24 sxl:mt-32 px-5 sm:px-10 md:px-24 sxl:px-32">
        {filteredBlogs.map((post, index) => (
          <article key={index} className="col-span-1 row-span-1 relative">
            <BlogLayoutThree post={post} />
          </article>
        ))}
      </div>
    </article>
  );
};

export default CategoryPage;