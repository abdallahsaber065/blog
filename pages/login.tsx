"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { signIn, useSession, signOut } from 'next-auth/react';
import { ClipLoader } from 'react-spinners';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const LoginPage = () => {
    const { data: session, status } = useSession();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // // check rate limit
        // const rateLimitCheck = await fetch(`/api/auth/rate-limit?apiRoute=login`);
        
        // if (!rateLimitCheck.ok) {
        //     const errorText = await rateLimitCheck.text();
        //     console.error(errorText);
        //     setError(errorText);
        //     setLoading(false);
        //     return;
        // }

        const result = await signIn('credentials', {
            redirect: false,
            email,
            password,
        });

        setLoading(false);

        if (result?.error) {
            setError(result.error);
        } else {
            router.push('/');
        }
    };

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
                        Sign in to your account
                    </CardTitle>
                    <CardDescription className="text-center">
                        Or{' '}
                        <Link href="/signup" className="font-medium text-accent hover:text-secondary-focus dark:text-secondary">
                            create a new account
                        </Link>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-slate-900 font-bold dark:text-slate-300">
                                Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="Email address"
                                className="bg-slate-100 dark:bg-gray"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-slate-900 font-bold dark:text-slate-300">
                                Password
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="Password"
                                className="bg-slate-100 dark:bg-gray"
                            />
                        </div>
                        {error && <p className="text-sm text-danger">{error}</p>}
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? <ClipLoader size={24} color="#ffffff" /> : 'Login'}
                        </Button>
                    </form>
                    <div className="mt-4 text-center">
                        <Link href="/auth/request-password-reset" className="font-medium text-accent hover:text-secondary-focus dark:text-secondary">
                            Forgot your password?
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default LoginPage;