// pages/authors/index.tsx
import React from 'react';
import { GetStaticProps } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, User, Sparkles, Mail } from 'lucide-react';

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
        <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
            {/* Hero Section */}
            <section className="relative px-5 sm:px-10 md:px-24 sxl:px-32 py-12 md:py-16 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border-b border-slate-200 dark:border-slate-800">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-start gap-4 mb-6">
                        <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                            <Users className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-slate-100 mb-3">
                                Meet Our Team
                            </h1>
                            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400">
                                Talented writers creating amazing content • {uniqueAuthors.length} {uniqueAuthors.length === 1 ? 'Author' : 'Authors'}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Authors Grid */}
            <main className="container mx-auto px-4 py-8 md:py-12 max-w-7xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {uniqueAuthors.map((author) => (
                        <Card key={author.username} className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                            <CardHeader className="pb-4">
                                <div className="flex flex-col items-center text-center space-y-4">
                                    {/* Profile Image */}
                                    {author.profile_image_url ? (
                                        <div className="relative">
                                            <Image
                                                src={`${process.env.NEXT_PUBLIC_BASE_URL}/${author.profile_image_url}`}
                                                alt={`${author.username}'s profile image`}
                                                className="rounded-full w-24 h-24 object-cover ring-4 ring-blue-100 dark:ring-blue-900 shadow-lg group-hover:ring-blue-200 dark:group-hover:ring-blue-800 transition-all"
                                                width={96}
                                                height={96}
                                            />
                                            <div className="absolute -bottom-2 -right-2 p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full shadow-lg">
                                                <Sparkles className="w-4 h-4 text-white" />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="relative">
                                            <div className="flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 rounded-full w-24 h-24 text-white shadow-lg ring-4 ring-blue-100 dark:ring-blue-900">
                                                <User className="w-12 h-12" />
                                            </div>
                                            <div className="absolute -bottom-2 -right-2 p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full shadow-lg">
                                                <Sparkles className="w-4 h-4 text-white" />
                                            </div>
                                        </div>
                                    )}

                                    {/* Name */}
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                                            {author.first_name} {author.last_name}
                                        </h2>
                                        <Badge variant="outline" className="text-xs">
                                            @{author.username}
                                        </Badge>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                                {/* Bio */}
                                <p className="text-sm text-slate-600 dark:text-slate-400 text-center mb-4 line-clamp-3 min-h-[3.75rem]">
                                    {author.bio || 'No bio available'}
                                </p>

                                {/* View Profile Button */}
                                <Link href={`/authors/${author.username}`} className="block">
                                    <Button className="w-full group-hover:shadow-lg transition-all">
                                        <User className="w-4 h-4 mr-2" />
                                        View Profile
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Empty State */}
                {uniqueAuthors.length === 0 && (
                    <Card className="border-dashed border-2 border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
                        <CardContent className="flex flex-col items-center justify-center py-16 md:py-24">
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 mb-6">
                                <Users className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h3 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-3">
                                No Authors Yet
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400 text-center max-w-md">
                                Check back soon to meet our team of content creators
                            </p>
                        </CardContent>
                    </Card>
                )}
            </main>
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