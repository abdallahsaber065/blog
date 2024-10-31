/* eslint-disable @next/next/no-img-element */
import { getSession, signIn, signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { GetServerSideProps } from 'next';
import { useState } from 'react';
import RequestVerification from '@/components/signup/RequestVerification';
import { MediaLibrary } from "@prisma/client";

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
    const { data: session, status , update} = useSession();
    const router = useRouter();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [currentImage, setCurrentImage] = useState<string | null>(null);
    const handleDeleteAccount = async () => {
        if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            try {
                const response = await fetch(`/api/users`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ targetId: user?.id }),
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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedFile(e.target.files[0]);
            setCurrentImage(URL.createObjectURL(e.target.files[0]));
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedFile) {
            toast.error('Please select a file to upload.');
            return;
        }

        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('userId', user?.id.toString() || '');
        formData.append('saveDir', 'profile-images');

        const res = await fetch('/api/upload-image', {
            method: 'POST',
            body: formData,
        });

        if (res.ok) {
            toast.success('File uploaded successfully.');
            const responsejson = await res.json();
            const media: MediaLibrary = responsejson.media;

            try {
                const data = {
                    profile_image_url: media.file_url,
                };

                const response = await fetch('/api/users', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        id: session?.user.id, data
                    }),
                });

                if (response.ok) {
                    toast.success('Profile image updated successfully.');
                    update({ profile_image_url: media.file_url });
                    router.reload();
                } else {
                    toast.error('Failed to update profile image.');
                }
            } catch (error) {
                toast.error('An error occurred. Please try again.');
            }
        } else {
            const data = await res.json();
            toast.error(data.error || 'Something went wrong');
        }
    };

    if (status === 'loading') {
        return <p>Loading...</p>;
    }

    if (status === 'unauthenticated') {
        return (
            <main className="container mx-auto py-16 px-4 flex-1 text-slate-900">
                <div className="max-w-md mx-auto bg-light dark:bg-dark p-8 rounded-lg shadow-lg">
                    <h1 className="text-4xl font-bold text-center mb-8 text-gray-800 dark:text-light">Profile</h1>
                    <p className="text-gray-800 dark:text-light">You need to be signed in to view your profile.</p>
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
        <div className="min-h-screen flex flex-col justify-between bg-light dark:bg-dark text-slate-900">
            <main className="container mx-auto py-16 px-4 flex-1">
                <div className="max-w-4xl mx-auto bg-light dark:bg-dark p-8 rounded-lg shadow-lg shadow-slate-300 dark:shadow-slate-800">
                    <h1 className="text-4xl font-bold text-center mb-8 text-gray-800 dark:text-light">Profile</h1>
                    {user ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <section className="space-y-4">
                                <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-light">Personal Information</h2>
                                <div className="text-gray-800 dark:text-light">
                                    <strong>Username:</strong> {user.username}
                                </div>
                                <div className="text-gray-800 dark:text-light">
                                    <strong>Email:</strong> {user.email}
                                </div>
                                <div className="text-gray-800 dark:text-light">
                                    <strong>First Name:</strong> {user.first_name}
                                </div>
                                <div className="text-gray-800 dark:text-light">
                                    <strong>Last Name:</strong> {user.last_name}
                                </div>
                                <div className="text-gray-800 dark:text-light">
                                    <strong>Bio:</strong> {user.bio}
                                </div>
                                <div className="text-gray-800 dark:text-light">
                                    <strong>Profile Image:</strong>
                                    {user.profile_image_url && (
                                        <img src={currentImage || user.profile_image_url} alt="Profile" className="w-24 h-24 rounded-full" />
                                    )}
                                </div>
                                <form onSubmit={handleUpload} className="space-y-4">
                                    <input type="file" onChange={handleFileChange} className="block w-full text-gray-800 dark:text-light" />
                                    <button type="submit" className="block w-full font-bold py-2 px-4 rounded mt-4 btn btn-primary">
                                        Upload New Profile Image
                                    </button>
                                </form>
                            </section>
                            <section className="space-y-4">
                                <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-light">Account Details</h2>
                                <div className="text-gray-800 dark:text-light">
                                    <strong>Role:</strong> {user.role}
                                </div>
                                <div className="text-gray-800 dark:text-light">
                                    <strong>Email Verified:</strong> {user.email_verified ? 'Yes' : 'No'}
                                    {!user.email_verified && <RequestVerification />}
                                </div>
                                <div className="text-gray-800 dark:text-light">
                                    <strong>Created At:</strong> {new Date(user.created_at).toLocaleString()}
                                </div>
                                <div className="text-gray-800 dark:text-light">
                                    <strong>Updated At:</strong> {new Date(user.updated_at).toLocaleString()}
                                </div>
                            </section>
                            <section className="col-span-1 md:col-span-2 space-y-4">
                                <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-light">Actions</h2>
                                <button
                                    onClick={() => router.push('/profile/edit')}
                                    className="block w-full font-bold py-2 px-4 rounded mt-4 btn btn-secondary"
                                >
                                    Edit Profile
                                </button>
                                <button
                                    onClick={() => router.push('/auth/request-password-reset')}
                                    className="block w-full font-bold py-2 px-4 rounded mt-4 btn btn-warning"
                                >
                                    Reset Password
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
                        <p className="text-gray-800 dark:text-light">Loading user data...</p>
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