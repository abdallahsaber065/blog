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
                <div className="min-h-screen bg-base-200 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-md w-full space-y-8">
                        <div>
                            <h2 className="mt-6 text-center text-3xl font-extrabold text-primary">
                                You are signed in as {session.user?.email}
                            </h2>
                            <div className="mt-4 flex justify-center space-x-4">
                                <button
                                    onClick={() => signOut(
                                        { callbackUrl: '/signup' }
                                    )}
                                    className="btn btn-secondary"
                                >
                                    Sign out
                                </button>
                                <button
                                    onClick={() => router.push('/')}
                                    className="btn btn-primary"
                                >
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
                            Create your account
                        </h2>
                        <p className="mt-2 text-center text-sm text-gray-600">
                            Or{' '}
                            <Link href="/login" className="font-medium text-secondary hover:text-secondary-focus">
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