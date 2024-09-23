import { PrismaClient } from '@prisma/client';
import BlogDetails from "@/components/Blog/BlogDetails";
import RenderMdx from "@/components/Blog/RenderMdx";
import { notFound } from "next/navigation";
import Image from "next/image";
import Tag from "@/components/Elements/Tag";
import siteMetadata from "@/utils/siteMetaData";
import { slug as slugger } from "github-slugger";
import { generateTOC } from "@/utils";

const prisma = new PrismaClient();

export async function generateStaticParams() {
  const posts = await prisma.post.findMany();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = await prisma.post.findUnique({
    where: { slug: params.slug },
    include: {
      author: true,
      tags: true,
    },
  });

  if (!post) {
    return;
  }

  const publishedAt = post.published_at ? new Date(post.published_at).toISOString() : null;
  const modifiedAt = new Date(post.updated_at || post.published_at).toISOString();

  let imageList = [siteMetadata.socialBanner];
  if (post.featured_image_url) {
    imageList = [post.featured_image_url];
  }
  const ogImages = imageList.map((img) => {
    return { url: img.includes("http") ? img : siteMetadata.siteUrl + img };
  });

  const authors = post?.author ? [post.author.username] : siteMetadata.author;

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: siteMetadata.siteUrl + `/blogs/${post.slug}`,
      siteName: siteMetadata.title,
      locale: "en_US",
      type: "article",
      publishedTime: publishedAt,
      modifiedTime: modifiedAt,
      images: ogImages,
      authors: authors.length > 0 ? authors : [siteMetadata.author],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: ogImages,
    },
  };
}

export default async function BlogPage({ params }: { params: { slug: string } }) {
  const post = await prisma.post.findUnique({
    where: { slug: params.slug },
    include: {
      author: true,
      tags: true,
    },
  });

  if (!post) {
    notFound();
  }

  const toc = generateTOC(post.content);

  let imageList = [siteMetadata.socialBanner];
  if (post.featured_image_url) {
    imageList = [post.featured_image_url];
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": post.title,
    "description": post.excerpt,
    "image": imageList,
    "datePublished": post.published_at ? new Date(post.published_at).toISOString() : null,
    "dateModified": new Date(post.updated_at || post.published_at).toISOString(),
    "author": [{
      "@type": "Person",
      "name": post?.author ? [post.author.username] : siteMetadata.author,
      "url": siteMetadata.twitter,
    }]
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article>
        <div className="mb-8 text-center relative w-full h-[70vh] bg-dark">
          <div className="w-full z-10 flex flex-col items-center justify-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <Tag
              name={post.tags[0].name}
              link={`/categories/${slugger(post.tags[0].name)}`}
              className="px-6 text-sm py-2"
            />
            <h1
              className="inline-block mt-6 font-semibold capitalize text-light text-2xl md:text-3xl lg:text-5xl !leading-normal relative w-5/6"
            >
              {post.title}
            </h1>
          </div>
          <div className="absolute top-0 left-0 right-0 bottom-0 h-full bg-dark/60 dark:bg-dark/40" />
          <Image
            src={post.featured_image_url || '/default-image.jpg'}
            placeholder="blur"
            blurDataURL={post.featured_image_url || '/default-image.jpg'}
            alt={post.title}
            width={800}
            height={600}
            className="aspect-square w-full h-full object-cover object-center"
            priority
            sizes="100vw"
          />
        </div>

        <BlogDetails post={post} postSlug={params.slug} tags={post.tags} />
        <div className="grid grid-cols-12 gap-y-8 lg:gap-8 sxl:gap-16 mt-8 px-5 md:px-10">
          <div className="col-span-12 lg:col-span-4">
            <details
              className="border-[1px] border-solid border-dark dark:border-light text-dark dark:text-light rounded-lg p-4 sticky top-6 max-h-[80vh] overflow-hidden overflow-y-auto"
              open
            >
              <summary className="text-lg font-semibold capitalize cursor-pointer">
                Table Of Content
              </summary>
              <ul className="mt-4 font-in text-base">
                {toc.map((heading) => {
                  return (
                    <li key={`#${heading.slug}`} className="py-1">
                      <a
                        href={`#${heading.slug}`}
                        data-level={heading.level}
                        className="data-[level=two]:pl-0 data-[level=two]:pt-2
                     data-[level=two]:border-t border-solid border-dark/40
                     data-[level=three]:pl-4
                     sm:data-[level=three]:pl-6
                     flex items-center justify-start"
                      >
                        {heading.level === "three" ? (
                          <span className="flex w-1 h-1 rounded-full bg-dark mr-2">
                            &nbsp;
                          </span>
                        ) : null}
                        <span className="hover:underline">{heading.text}</span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </details>
          </div>
          <RenderMdx post={post} />
        </div>
      </article>
    </>
  );
}