/* eslint-disable @next/next/no-img-element */
import { getSession, signOut, useSession } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { GetServerSideProps } from 'next';
import { da } from 'date-fns/locale';

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

interface EditProfilePageProps {
    user: User;
}

const EditProfilePage = ({ user }: EditProfilePageProps) => {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [formData, setFormData] = useState({
        username: user.username,
        email: user.email,
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        bio: user.bio || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {

            const data = {
                ...formData,
            }

            const response = await fetch('/api/users', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: user.id, data }),
            });

            if (response.ok) {
                toast.success('Profile updated successfully.');
                // if email is updated send verification email
                if (formData.email !== user.email) {
                    const res = await fetch('/api/auth/request-verification', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ email: formData.email }),
                    });
                    const data = await res.json();
                    if (res.ok) {
                        toast.success('Verification email sent successfully.');
                    } else {
                        toast.error(data.error);
                    }
                    // sign out user if email is updated
                    signOut();
                }
                router.push('/profile');
            } else {
                toast.error('Failed to update profile.');
            }
        } catch (error) {
            toast.error('An error occurred. Please try again.');
        }
    };

    if (status === 'loading') {
        return <div className="flex justify-center items-center min-h-screen"><div className="spinner"></div></div>;
    }

    if (status === 'unauthenticated') {
        return (
            <main className="container mx-auto py-16 px-4 flex-1 text-slate-900">
                <div className="max-w-md mx-auto bg-light dark:bg-dark p-8 rounded-lg shadow-lg">
                    <h1 className="text-4xl font-bold text-center mb-8 text-gray-800 dark:text-light">Edit Profile</h1>
                    <p className="text-gray-800 dark:text-light">You need to be signed in to edit your profile.</p>
                </div>
            </main>
        );
    }

    return (
        <div className="min-h-screen flex flex-col justify-between bg-light dark:bg-dark text-slate-900">
            <main className="container mx-auto py-16 px-4 flex-1">
                <div className="max-w-4xl mx-auto bg-light dark:bg-dark p-8 rounded-lg shadow-lg shadow-slate-300 dark:shadow-slate-800">
                    <h1 className="text-4xl font-bold text-center mb-8 text-gray-800 dark:text-light">Edit Profile</h1>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="form-control">
                            <label className="label" htmlFor="username">
                                <span className="label-text  block mb-1 text-gray-800 dark:text-light font-bold text-lg">Username</span>
                            </label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                className="input input-bordered w-full bg-white text-black dark:bg-dark dark:text-white"
                                required
                            />
                        </div>
                        <div className="form-control">
                            <label className="label" htmlFor="email">
                                <span className="label-text  block mb-1 text-gray-800 dark:text-light font-bold text-lg">Email</span>
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="input input-bordered w-full bg-white text-black dark:bg-dark dark:text-white"
                                required
                            />
                        </div>
                        <div className="form-control">
                            <label className="label" htmlFor="first_name">
                                <span className="label-text  block mb-1 text-gray-800 dark:text-light font-bold text-lg">First Name</span>
                            </label>
                            <input
                                type="text"
                                id="first_name"
                                name="first_name"
                                value={formData.first_name}
                                onChange={handleChange}
                                className="input input-bordered w-full bg-white text-black dark:bg-dark dark:text-white"
                            />
                        </div>
                        <div className="form-control">
                            <label className="label" htmlFor="last_name">
                                <span className="label-text  block mb-1 text-gray-800 dark:text-light font-bold text-lg">Last Name</span>
                            </label>
                            <input
                                type="text"
                                id="last_name"
                                name="last_name"
                                value={formData.last_name}
                                onChange={handleChange}
                                className="input input-bordered w-full bg-white text-black dark:bg-dark dark:text-white"
                            />
                        </div>
                        <div className="form-control">
                            <label className="label" htmlFor="bio">
                                <span className="label-text  block mb-1 text-gray-800 dark:text-light font-bold text-lg">Bio</span>
                            </label>
                            <textarea
                                id="bio"
                                name="bio"
                                value={formData.bio}
                                onChange={handleChange}
                                className="textarea textarea-bordered w-full bg-white text-black dark:bg-dark dark:text-white"
                            />
                        </div>
                        <button type="submit" className="btn btn-primary w-full mt-4">
                            Save Changes
                        </button>
                    </form>
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

export default EditProfilePage;