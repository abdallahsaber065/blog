// pages/authors/[username].tsx
import React from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { FaUser } from 'react-icons/fa';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

interface AuthorProps {
    author: {
        username: string;
        first_name: string;
        last_name: string;
        bio: string;
        profile_image_url: string;
        posts: {
            id: number;
            title: string;
            slug: string;
            excerpt: string;
            featured_image_url: string;
        }[];
    } | null;
}

const AuthorPage: React.FC<AuthorProps> = ({ author }) => {
    const router = useRouter();

    if (!author) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-light dark:bg-dark text-slate-900 dark:text-light">
                <p className="text-2xl text-slate-800 dark:text-light">Author not found</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-light dark:bg-dark text-slate-900 dark:text-light">
            <div className="max-w-2xl w-full bg-white dark:bg-dark p-8 rounded-lg shadow-lg shadow-accent dark:shadow-accentDark">
                <div className="flex flex-col items-center">
                    {author.profile_image_url ? (
                        <Image
                            src={process.env.NEXT_PUBLIC_BASE_URL + "/" + author.profile_image_url}
                            alt={`${author.username}'s profile image`}
                            className="rounded-full w-24 h-24 object-cover"
                            width={96}
                            height={96}
                        />
                    ) : (
                        <div className="flex items-center justify-center bg-slate-950 rounded-full w-24 h-24 object-cover text-white text-3xl font-bold">
                            <FaUser />
                        </div>
                    )}
                    <h1 className="text-4xl font-bold text-center text-slate-800 dark:text-light mt-4">
                        {author.first_name} {author.last_name}
                    </h1>
                    <p className="text-slate-800 dark:text-light mt-2">@{author.username}</p>
                    <p className="text-slate-800 dark:text-light mt-4">{author.bio}</p>
                </div>
            </div>
            <div className="max-w-2xl w-full bg-white dark:bg-dark p-8 rounded-lg shadow-lg shadow-accent dark:shadow-accentDark mt-8">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-light mb-4">Posts by {author.username}</h2>
                {author.posts.length > 0 ? (
                    <ul className="space-y-4">
                        {author.posts.map((post) => (
                            <li key={post.id} className="border-b border-slate-300 dark:border-slate-700 pb-4">
                                <h3 className="text-xl font-bold text-slate-800 dark:text-light">
                                    <Link href={`/posts/${post.slug}`} className="hover:underline">
                                        {post.title}
                                    </Link>
                                </h3>
                                <p className="text-slate-600 dark:text-slate-400 mt-2">{post.excerpt}</p>
                                {post.featured_image_url && (
                                    <Image
                                        src={post.featured_image_url.startsWith('http') || post.featured_image_url.startsWith('/') ? post.featured_image_url : '/' + post.featured_image_url}
                                        alt={post.title}
                                        className="rounded mt-2"
                                        width={600}
                                        height={400}
                                    />
                                )}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-slate-800 dark:text-light">No posts found.</p>
                )}
            </div>
        </div>
    );
};

export const getStaticPaths: GetStaticPaths = async () => {
    const authors = await prisma.user.findMany({
        select: { username: true }
    });

    return {
        paths: authors.map(author => ({
            params: { username: author.username }
        })),
        fallback: 'blocking'
    };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
    const { username } = params as { username: string };

    const author = await prisma.user.findUnique({
        where: { username },
        select: {
            username: true,
            first_name: true,
            last_name: true,
            bio: true,
            profile_image_url: true,
            posts: {
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    excerpt: true,
                    featured_image_url: true,
                },
                where: {
                    status: {
                        equals: 'published'
                    }
                }
            },
        },
    });

    if (!author) {
        return {
            notFound: true
        };
    }

    return {
        props: { author },
        revalidate: false
    };
};

export default AuthorPage;