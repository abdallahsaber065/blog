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
            <div className=" bg-light dark:bg-dark flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div>
                        <h2 className="mt-6 text-center text-2xl sm:text-3xl font-extrabold text-primary dark:text-accentDark break-words">
                            You are signed in as {session.user?.email}
                        </h2>
                        <div className="mt-4 flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                            <button onClick={() => signOut({ callbackUrl: '/login' })} className="btn btn-accent w-full sm:w-auto">
                                Sign out
                            </button>
                            <button onClick={() => router.push('/')} className="btn btn-primary w-full sm:w-auto">
                                Go to Home
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className=" bg-light dark:bg-dark flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray dark:text-primary">
                        Sign in to your account
                    </h2>
                    <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
                        Or{' '}
                        <Link href="/signup" className="font-medium text-accent hover:text-secondary-focus dark:text-secondary">
                            create a new account
                        </Link>
                    </p>
                </div>
                <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text text-slate-900 font-bold dark:text-slate-300">Email</span>
                            </label>
                            <input
                                title="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="input input-bordered w-full bg-slate-100 dark:bg-gray text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-primary dark:focus:ring-accent focus:outline-none border-accent dark:border-primary"
                                placeholder="Email address"
                            />
                        </div>
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text text-slate-900 font-bold dark:text-slate-300">Password</span>
                            </label>
                            <input
                                title="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="input input-bordered w-full bg-slate-100 dark:bg-gray text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-primary dark:focus:ring-accent focus:outline-none border-accent dark:border-primary"
                                placeholder="Password"
                            />
                        </div>
                    </div>
                    {error && <p className="mt-2 text-sm text-danger">{error}</p>}
                    <div className="flex justify-between mt-4">
                        <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                            {loading ? <ClipLoader size={24} color="#ffffff" /> : 'Login'}
                        </button>
                    </div>
                </form>
                <div className="mt-4 text-center">
                    <Link href="/auth/request-password-reset" className="font-medium text-accent hover:text-secondary-focus dark:text-secondary">
                        Forgot your password?
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;