// pages/authors/[username].tsx
import React from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import SmartImage from '../../components/SmartImage';
import { User, FileText, ArrowLeft, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
            <div className="min-h-screen flex items-center justify-center bg-light dark:bg-dark">
                <p className="text-2xl font-display font-semibold text-muted-foreground">Author not found</p>
            </div>
        );
    }

    return (
        <main className="flex flex-col items-center w-full bg-light dark:bg-dark overflow-hidden min-h-screen pb-20 sm:pb-28">
            <Link href="/authors" className="absolute top-24 left-6 sm:left-12 z-20">
                <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Authors
                </Button>
            </Link>

            {/* Hero Section */}
            <section className="relative w-full flex flex-col items-center justify-center text-center px-6 pt-32 pb-16 sm:pt-40 sm:pb-24">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gold/[0.06] rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-16 left-1/4 w-[400px] h-[300px] bg-gold/[0.04] rounded-full blur-3xl pointer-events-none" />

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="relative mb-6"
                >
                    <div className="absolute inset-0 bg-gold/[0.15] rounded-full blur-lg scale-110 pointer-events-none" />
                    {author.profile_image_url ? (
                        <SmartImage
                            src={author.profile_image_url}
                            alt={`${author.username}'s profile image`}
                            imgClassName="relative rounded-full w-32 h-32 sm:w-40 sm:h-40 object-cover ring-4 ring-gold/30 dark:ring-gold/40 shadow-xl border-2 border-gold/20"
                            className="relative rounded-full w-32 h-32 sm:w-40 sm:h-40 object-cover ring-4 ring-gold/30 dark:ring-gold/40 shadow-xl border-2 border-gold/20"
                            width={160}
                            height={160}
                        />
                    ) : (
                        <div className="relative flex items-center justify-center bg-gold/10 text-gold rounded-full w-32 h-32 sm:w-40 sm:h-40 shadow-xl ring-4 ring-gold/30 dark:ring-gold/40 border-2 border-gold/20">
                            <User className="w-16 h-16 sm:w-20 sm:h-20" />
                        </div>
                    )}
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-foreground mb-3"
                >
                    {author.first_name} {author.last_name}
                </motion.h1>

                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <Badge variant="outline" className="text-sm bg-muted/50 text-gold border-lightBorder dark:border-darkBorder px-3 py-1 mt-2">
                        @{author.username}
                    </Badge>
                </motion.div>

                <motion.p
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed mx-auto"
                >
                    {author.bio || "This author hasn't added a bio yet."}
                </motion.p>
            </section>

            {/* Posts Section */}
            <section className="w-full max-w-5xl mx-auto px-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="flex items-center gap-3 mb-8"
                >
                    <div className="w-1 h-8 rounded-full bg-gold" />
                    <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
                        Published Posts
                    </h2>
                    <Badge variant="secondary" className="ml-2 bg-gold/10 text-gold hover:bg-gold/20">
                        {author.posts.length}
                    </Badge>
                </motion.div>

                {author.posts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                        {author.posts.map((post, index) => (
                            <motion.div
                                key={post.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.5 + (index * 0.1) }}
                            >
                                <Link href={`/blogs/${post.slug}`} className="block h-full transition-transform hover:-translate-y-1 hover:shadow-2xl duration-300 rounded-2xl group">
                                    <div className="flex flex-col h-full bg-card border border-lightBorder dark:border-darkBorder shadow-card dark:shadow-card-dark rounded-2xl overflow-hidden">
                                        {post.featured_image_url && (
                                            <div className="relative w-full h-48 sm:h-56 overflow-hidden border-b border-lightBorder dark:border-darkBorder">
                                                <Image
                                                    src={post.featured_image_url.startsWith('http') || post.featured_image_url.startsWith('/') ? post.featured_image_url : '/' + post.featured_image_url}
                                                    alt={post.title}
                                                    layout="fill"
                                                    objectFit="cover"
                                                    className="group-hover:scale-105 transition-transform duration-500"
                                                />
                                            </div>
                                        )}
                                        <div className="p-6 flex flex-col flex-grow">
                                            <h3 className="text-xl sm:text-2xl font-bold font-display text-foreground mb-3 group-hover:text-gold transition-colors line-clamp-2">
                                                {post.title}
                                            </h3>
                                            <p className="text-sm text-muted-foreground line-clamp-3 mb-6 flex-grow">
                                                {post.excerpt}
                                            </p>
                                            <div className="flex items-center justify-between text-gold font-medium text-sm mt-auto">
                                                <span className="flex items-center gap-2">
                                                    <FileText className="w-4 h-4" />
                                                    Read post
                                                </span>
                                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, delay: 0.5 }}
                        className="flex flex-col items-center justify-center p-12 bg-card/50 border border-dashed border-lightBorder dark:border-darkBorder rounded-2xl"
                    >
                        <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mb-4 border border-gold/20">
                            <FileText className="w-8 h-8 text-gold" />
                        </div>
                        <p className="text-lg text-foreground font-medium mb-1">No posts yet</p>
                        <p className="text-muted-foreground text-center">
                            When {author.first_name} publishes their first post, it will appear here.
                        </p>
                    </motion.div>
                )}
            </section>
        </main>
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