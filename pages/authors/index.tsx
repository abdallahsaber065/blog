// pages/authors/index.tsx
import React from 'react';
import { GetStaticProps } from 'next';
import Link from 'next/link';
import SmartImage from '@/components/SmartImage';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, User, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

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
        <main className="flex flex-col items-center w-full bg-light dark:bg-dark overflow-hidden min-h-screen">
            {/* Hero Section */}
            <section className="relative w-full flex flex-col items-center justify-center text-center px-6 pt-24 pb-20 sm:pt-32 sm:pb-28">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gold/[0.06] rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-16 left-1/4 w-[400px] h-[300px] bg-gold/[0.04] rounded-full blur-3xl pointer-events-none" />

                <motion.div
                    initial={{ opacity: 0, y: -16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.05 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/10 border border-gold/25 text-gold text-xs font-semibold tracking-wider uppercase mb-6"
                >
                    <Users className="w-3 h-3" />
                    Our Team
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.15 }}
                    className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold text-foreground leading-tight max-w-3xl"
                >
                    Meet the <span className="text-gold">authors</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="mt-6 text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed"
                >
                    Talented writers creating amazing content &bull; {uniqueAuthors.length} {uniqueAuthors.length === 1 ? 'Author' : 'Authors'}
                </motion.p>
            </section>

            {/* Authors Grid */}
            <section className="w-full max-w-7xl mx-auto px-6 pb-20 sm:pb-28 relative z-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {uniqueAuthors.map((author, index) => (
                        <motion.div
                            key={author.username}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 * index }}
                        >
                            <Card className="group h-full flex flex-col bg-card border border-lightBorder dark:border-darkBorder shadow-card dark:shadow-card-dark hover:shadow-xl dark:hover:shadow-card-dark transition-all duration-300 hover:-translate-y-1">
                                <CardHeader className="pb-4">
                                    <div className="flex flex-col items-center text-center space-y-4">
                                        {/* Profile Image */}
                                        {author.profile_image_url ? (
                                            <div className="relative">
                                                <div className="absolute inset-0 bg-gold/[0.15] rounded-full blur-md scale-110 pointer-events-none group-hover:bg-gold/[0.25] transition-colors" />
                                                <SmartImage
                                                    src={author.profile_image_url || '/default-avatar.webp'}
                                                    alt={`${author.username}'s profile image`}
                                                    imgClassName="relative rounded-full w-24 h-24 object-cover ring-2 ring-gold/30 dark:ring-gold/40 shadow-lg group-hover:ring-gold border border-gold/20 transition-all"
                                                    className="relative rounded-full w-24 h-24 object-cover ring-2 ring-gold/30 dark:ring-gold/40 shadow-lg group-hover:ring-gold border border-gold/20 transition-all"
                                                    width={96}
                                                    height={96}
                                                />
                                                <div className="absolute -bottom-2 -right-2 p-1.5 bg-gradient-to-br from-gold to-goldDark rounded-full shadow-lg border-2 border-card">
                                                    <Sparkles className="w-4 h-4 text-white" />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="relative">
                                                <div className="flex items-center justify-center bg-gold/10 text-gold rounded-full w-24 h-24 shadow-lg ring-2 ring-gold/30 dark:ring-gold/40 group-hover:ring-gold transition-all border border-gold/20">
                                                    <User className="w-10 h-10" />
                                                </div>
                                            </div>
                                        )}

                                        {/* Name */}
                                        <div>
                                            <h2 className="text-xl font-display font-bold text-foreground mb-1 group-hover:text-gold transition-colors">
                                                {author.first_name} {author.last_name}
                                            </h2>
                                            <Badge variant="outline" className="text-xs bg-muted/50 text-muted-foreground border-lightBorder dark:border-darkBorder">
                                                @{author.username}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-0 flex flex-col flex-1">
                                    {/* Bio */}
                                    <p className="text-sm text-muted-foreground text-center mb-6 line-clamp-3 flex-1 flex items-center justify-center">
                                        {author.bio || 'No bio available'}
                                    </p>

                                    {/* View Profile Button */}
                                    <Link href={`/authors/${author.username}`} className="block mt-auto w-full">
                                        <Button className="w-full gap-2 shadow-sm hover:shadow-gold-sm hover:bg-gold hover:text-dark transition-all">
                                            <User className="w-4 h-4" />
                                            View Profile
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* Empty State */}
                {uniqueAuthors.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4 }}
                    >
                        <Card className="border-dashed border-2 bg-card/50 border-lightBorder dark:border-darkBorder shadow-none">
                            <CardContent className="flex flex-col items-center justify-center py-16 md:py-24">
                                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gold/10 border border-gold/20 mb-6">
                                    <Users className="w-10 h-10 text-gold" />
                                </div>
                                <h3 className="text-2xl font-display font-semibold text-foreground mb-3">
                                    No Authors Yet
                                </h3>
                                <p className="text-muted-foreground text-center max-w-md">
                                    Check back soon to meet our team of content creators.
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </section>
        </main>
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