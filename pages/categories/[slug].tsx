import { prisma } from '@/lib/prisma';
import BlogLayoutThree from "@/components/Blog/BlogLayoutThree";
import { GetStaticProps, GetStaticPaths } from 'next';
import { useState } from 'react';
import Link from 'next/link';

// Define TypeScript types
interface Post {
    slug: string;
    title: string;
    created_at: string;
    updated_at: string;
    published_at: string | null;
    featured_image_url: string;
    tags: { slug: string; name: string }[];
}

interface Category {
    slug: string;
    name: string;
}

export const getStaticPaths: GetStaticPaths = async () => {
    const categories = await prisma.category.findMany();
    const paths = categories.map(category => ({
        params: { slug: category.slug },
    }));

    return {
        paths,
        fallback: 'blocking', // Generate pages on-demand if not generated at build time
    };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
    const { slug } = params as { slug: string };

    const [posts, allCategories] = await Promise.all([
        prisma.post.findMany({
            where: { status: "published" },
            select: {
                slug: true,
                title: true,
                created_at: true,
                updated_at: true,
                published_at: true,
                featured_image_url: true,
                tags: {
                    select: {
                        slug: true,
                        name: true,
                    },
                },
            },
        }),
        prisma.category.findMany({
            where: { posts: { some: { status: "published" } } },
            select: {
                slug: true,
                name: true,
            },
        }),
    ]);

    const filteredBlogs = posts.filter(post => {
        if (slug === "all") return true;
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
        revalidate: false // Only revalidate on-demand
    };
};

// Utility function for deserialization
const deserializePosts = (posts: Post[]) => posts.map(post => ({
    ...post,
    created_at: new Date(post.created_at).toISOString(),
    updated_at: new Date(post.updated_at).toISOString(),
    published_at: post.published_at ? new Date(post.published_at).toISOString() : null,
}));

const CategoryPage = ({ slug, posts, categories }: { slug: string, posts: Post[], categories: Category[] }) => {
    const deserializedPosts = deserializePosts(posts);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredCategories = categories.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <article className="mt-4 flex flex-col text-dark dark:text-light">
            <div className="flex flex-col md:flex-row">
                <aside className="w-full md:w-1/4 p-5">
                    <input
                        type="text"
                        placeholder="Search categories"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-2 mb-4 border rounded dark:bg-slate-800 dark:text-white"
                    />
                    <ul>
                        <li key="all" className={`mb-2 ${slug === "all" ? 'font-bold text-blue-500' : ''}`}>
                            <Link href={`/categories/all`} className="hover:underline">
                                All
                            </Link>
                        </li>
                        {filteredCategories.map((category) => (
                            <li key={category.slug} className={`mb-2 ${category.slug === slug ? 'font-bold text-blue-500' : ''}`}>
                                <Link href={`/categories/${category.slug}`} className="hover:underline">
                                    {category.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </aside>
                <div className="w-full md:w-3/4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-16 mt-5 sm:mt-10 md:mt-24 sxl:mt-32 px-5 sm:px-10 md:px-24 sxl:px-32">
                    {deserializedPosts.map((post, index) => (
                        <article key={index} className="col-span-1 row-span-1 relative">
                            <BlogLayoutThree post={post} />
                        </article>
                    ))}
                </div>
            </div>
        </article>
    );
};

export default CategoryPage;