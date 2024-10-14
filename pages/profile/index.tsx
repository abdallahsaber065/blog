/* eslint-disable @next/next/no-img-element */
import { getSession, signIn, signOut, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import RequestVerification from '@/components/signup/RequestVerification';
import { useRouter } from 'next/router';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { GetServerSideProps } from 'next';

interface User {
    id: string;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    bio: string;
    profile_image_url: string;
    role: string;
    email_verified: boolean;
    created_at: string;
    updated_at: string;
}

interface ProfilePageProps {
    user: User | null;
}

const ProfilePage = ({ user }: ProfilePageProps) => {
    const { data: session, status } = useSession();
    const router = useRouter();

    const handleDeleteAccount = async () => {
        if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            try {
                const response = await fetch('/api/users', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ id: user?.id }),
                });

                if (response.ok) {
                    toast.success('Account deleted successfully.');
                    signOut();
                } else {
                    toast.error('Failed to delete account.');
                }
            } catch (error) {
                toast.error('An error occurred. Please try again.');
            }
        }
    };

    if (status === 'loading') {
        return <p>Loading...</p>;
    }

    if (status === 'unauthenticated') {
        return (
            <main className="container mx-auto py-16 px-4 flex-1">
                <div className="max-w-md mx-auto bg-base-200 p-8 rounded-lg shadow-lg">
                    <h1 className="text-4xl font-bold text-center mb-8">Profile</h1>
                    <p>You need to be signed in to view your profile.</p>
                    <button
                        onClick={() => signIn()}
                        className="block w-full font-bold py-2 px-4 rounded mt-8 btn btn-primary"
                    >
                        Sign In
                    </button>
                </div>
            </main>
        );
    }

    return (
        <div className="min-h-screen flex flex-col justify-between bg-base-100">
            <ToastContainer />
            <main className="container mx-auto py-16 px-4 flex-1">
                <div className="max-w-4xl mx-auto bg-base-200 p-8 rounded-lg shadow-lg">
                    <h1 className="text-4xl font-bold text-center mb-8">Profile</h1>
                    {user ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <section className="space-y-4">
                                <h2 className="text-2xl font-bold mb-4">Personal Information</h2>
                                <div>
                                    <strong>Username:</strong> {user.username}
                                </div>
                                <div>
                                    <strong>Email:</strong> {user.email}
                                </div>
                                <div>
                                    <strong>First Name:</strong> {user.first_name}
                                </div>
                                <div>
                                    <strong>Last Name:</strong> {user.last_name}
                                </div>
                                <div>
                                    <strong>Bio:</strong> {user.bio}
                                </div>
                                <div>
                                    <strong>Profile Image:</strong>
                                    {user.profile_image_url && (
                                        <img src={user.profile_image_url} alt="Profile" className="w-24 h-24 rounded-full" />
                                    )}
                                </div>
                            </section>
                            <section className="space-y-4">
                                <h2 className="text-2xl font-bold mb-4">Account Details</h2>
                                <div>
                                    <strong>Role:</strong> {user.role}
                                </div>
                                <div>
                                    <strong>Email Verified:</strong> {user.email_verified ? 'Yes' : 'No'}
                                    {!user.email_verified && <RequestVerification />}
                                </div>
                                <div>
                                    <strong>Created At:</strong> {new Date(user.created_at).toLocaleString()}
                                </div>
                                <div>
                                    <strong>Updated At:</strong> {new Date(user.updated_at).toLocaleString()}
                                </div>
                            </section>
                            <section className="col-span-1 md:col-span-2 space-y-4">
                                <h2 className="text-2xl font-bold mb-4">Actions</h2>
                                <button
                                    onClick={() => router.push('/profile/edit')}
                                    className="block w-full font-bold py-2 px-4 rounded mt-4 btn btn-secondary"
                                >
                                    Edit Profile
                                </button>
                                <button
                                    onClick={handleDeleteAccount}
                                    className="block w-full font-bold py-2 px-4 rounded mt-4 btn btn-error"
                                >
                                    Delete Account
                                </button>
                            </section>
                        </div>
                    ) : (
                        <p>Loading user data...</p>
                    )}
                </div>
            </main>
        </div>
    );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = await getSession(context);

    if (!session) {
        return {
            redirect: {
                destination: '/api/auth/signin',
                permanent: false,
            },
        };
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/user`, {
        headers: {
            cookie: context.req.headers.cookie || '',
        },
    });

    const user = await res.json();

    return {
        props: {
            user,
        },
    };
};

export default ProfilePage;