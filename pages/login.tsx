import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { signIn, useSession, signOut } from 'next-auth/react';

import { ClipLoader } from 'react-spinners';

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
            <div className="min-h-screen bg-base-200 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div>
                        <h2 className="mt-6 text-center text-3xl font-extrabold text-primary">
                            You are signed in as {session.user?.email}
                        </h2>
                        <div className="mt-4 flex justify-center space-x-4">
                            <button onClick={() => signOut({ callbackUrl: '/login' })} className="btn btn-secondary">
                                Sign out
                            </button>
                            <button onClick={() => router.push('/')} className="btn btn-primary">
                                Go to Home
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-base-200 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-primary">
                        Sign in to your account
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Or{' '}
                        <Link href="/signup" className="font-medium text-secondary hover:text-secondary-focus">
                            create a new account
                        </Link>
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text text-secondary">Email</span>
                            </label>
                            <input
                                title="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="input input-bordered w-full"
                                placeholder="Email address"
                            />
                        </div>
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text text-secondary">Password</span>
                            </label>
                            <input
                                title="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="input input-bordered w-full"
                                placeholder="Password"
                            />
                        </div>
                    </div>
                    {error && <p className="mt-2 text-sm text-error">{error}</p>}
                    <div className="flex justify-between mt-4">
                        <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                            {loading ? <ClipLoader size={24} color="#ffffff" /> : 'Login'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
