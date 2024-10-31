// pages/api/auth/[...nextauth].ts
import NextAuth from 'next-auth';
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import bcrypt from 'bcryptjs';

declare module 'next-auth' {
    interface User {
        id: string;
        email_verified: boolean | null;
        role: string;
        name: string;
        profile_image_url: string | null;

    }

    interface Session {
        user: {
            id: string;
            email: string;
            email_verified: boolean | null;
            role: string;
            name: string;
            profile_image_url: string 
        };
    }

    interface JWT {
        id: string;
        email: string;
        email_verified: boolean | null;
        role: string;
        name: string;
        profile_image_url: string;
    }
}

const options: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            authorize: async (credentials) => {
                if (!credentials) {
                    return null;
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                });

                if (user && await bcrypt.compare(credentials.password, user.password)) {
                    return {
                        id: String(user.id),
                        email: user.email,
                        email_verified: user.email_verified,
                        role: user.role,
                        name: user.first_name + ' ' + user.last_name,
                        profile_image_url: user.profile_image_url,
                    };
                } else {
                    return null;
                }
            },
        }),
    ],
    adapter: PrismaAdapter(prisma),
    session: {
        strategy: 'jwt',
    },
    jwt: {
        secret: process.env.SECRET_KEY,
    },
    callbacks: {
        async session({ session, token }) {
            if (token) {
                session.user = {
                    id: token.id as string,
                    email: token.email as string,
                    email_verified: token.email_verified as boolean | null,
                    role: token.role as string,
                    name: token.name as string,
                    profile_image_url: token.profile_image_url as string,
                };
            }
            return session;
        },
        async jwt({ token, user, trigger, session }) {
            if (trigger === "update" && session) {
                token.profile_image_url = session.profile_image_url || token.profile_image_url
            }
            if (user) {
                token.id = user.id;
                token.email = user.email;
                token.email_verified = user.email_verified;
                token.role = user.role;
                token.name = user.name;
                token.profile_image_url = user.profile_image_url;
            }
            return token;
        },
    },
    pages: {
        signIn: '/login',
    },
};

export default NextAuth(options);

