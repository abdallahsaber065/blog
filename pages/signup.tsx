"use client";
import React from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import SignupForm from '@/components/signup/SignupForm';

const SignupPage = () => {
    const { data: session, status } = useSession();
    const router = useRouter();

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
                        Create your account
                    </h2>
                    <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
                        Or{' '}
                        <Link href="/login" className="font-medium text-accent hover:text-secondary-focus dark:text-secondary">
                            sign in to your account
                        </Link>
                    </p>
                </div>
                <SignupForm />
            </div>
        </div>
    );
};

export default SignupPage;