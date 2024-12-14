// pages/authors/index.tsx
import React from 'react';
import { GetStaticProps } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import { FaUser } from 'react-icons/fa';

interface Author {
    username: string;
    first_name: string;
    last_name: string;
    profile_image_url: string;
    bio: string;
}

interface AuthorsPageProps {
    authors: Author[];
}

const AuthorsPage: React.FC<AuthorsPageProps> = ({ authors }) => {
    // Filter out duplicate authors based on username
    const uniqueAuthors = authors.filter((author, index, self) =>
        index === self.findIndex((a) => a.username === author.username)
    );

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-light dark:bg-dark text-slate-900 dark:text-light">
            <div className="max-w-6xl w-full p-8 rounded-lg shadow-lg bg-white dark:bg-dark">
                <h1 className="text-5xl font-bold text-center text-slate-800 dark:text-light mb-12">Meet Our Team</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {uniqueAuthors.map((author) => (
                        <div key={author.username} className="bg-white dark:bg-dark p-6 rounded-lg shadow-lg transform transition duration-500 hover:scale-105">
                            <div className="flex flex-col items-center">
                                {author.profile_image_url ? (
                                    <Image
                                        src={process.env.NEXT_PUBLIC_BASE_URL + "/" + + author.profile_image_url}
                                        alt={`${author.username}'s profile image`}
                                        className="rounded-full w-24 h-24 object-cover"
                                        width={96}
                                        height={96}
                                    />
                                ) : (
                                    <div className="flex items-center justify-center bg-slate-700 dark:bg-slate-600 rounded-full w-24 h-24 object-cover text-white text-3xl font-bold">
                                        <FaUser />
                                    </div>
                                )}
                                <h2 className="text-2xl font-bold text-slate-800 dark:text-light mt-4">
                                    <Link href={`/authors/${author.username}`} className="hover:underline">
                                        {author.first_name} {author.last_name}
                                    </Link>
                                </h2>
                                <p className="text-slate-600 dark:text-slate-400">@{author.username}</p>
                                <p className="text-slate-800 dark:text-light mt-2 text-center">{author.bio}</p>
                                <Link href={`/authors/${author.username}`}>
                                    <button className="mt-4 px-4 py-2 bg-blue-500 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-600 dark:hover:bg-blue-800 transition duration-300">
                                        View Profile
                                    </button>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export const getStaticProps: GetStaticProps = async () => {
    const authors = await prisma.user.findMany({
        where: {
            role: {
                in: ['admin', 'moderator', 'editor'],
            },
        },
        select: {
            username: true,
            first_name: true,
            last_name: true,
            profile_image_url: true,
            bio: true,
        },
    });

    return {
        props: { authors },
        revalidate: false,
    };
};

export default AuthorsPage;