"use client";
import React from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import SignupForm from '@/components/signup/SignupForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const SignupPage = () => {
    const { data: session, status } = useSession();
    const router = useRouter();

    if (status === 'loading') {
        return <p>Loading...</p>;
    }

    if (session) {
        return (
            <div className="bg-light dark:bg-dark flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <Card className="max-w-md w-full">
                    <CardHeader>
                        <CardTitle className="text-center text-2xl sm:text-3xl break-words">
                            You are signed in as {session.user?.email}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                        <Button onClick={() => signOut({ callbackUrl: '/login' })} variant="secondary" className="w-full sm:w-auto">
                            Sign out
                        </Button>
                        <Button onClick={() => router.push('/')} className="w-full sm:w-auto">
                            Go to Home
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="bg-light dark:bg-dark flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <Card className="max-w-md w-full">
                <CardHeader>
                    <CardTitle className="text-center text-3xl">
                        Create your account
                    </CardTitle>
                    <CardDescription className="text-center">
                        Or{' '}
                        <Link href="/login" className="font-medium text-accent hover:text-secondary-focus dark:text-secondary">
                            sign in to your account
                        </Link>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <SignupForm />
                </CardContent>
            </Card>
        </div>
    );
};

export default SignupPage;