/* eslint-disable @next/next/no-img-element */
import { getSession, useSession } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
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
            const response = await fetch('/api/users', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: user.id, ...formData }),
            });

            if (response.ok) {
                toast.success('Profile updated successfully.');
                router.push('/profile');
            } else {
                toast.error('Failed to update profile.');
            }
        } catch (error) {
            toast.error('An error occurred. Please try again.');
        }
    };

    if (status === 'loading') {
        return <p>Loading...</p>;
    }

    if (status === 'unauthenticated') {
        return (
                <main className="container mx-auto py-16 px-4 flex-1">
                    <div className="max-w-md mx-auto bg-base-200 p-8 rounded-lg shadow-lg">
                        <h1 className="text-4xl font-bold text-center mb-8">Edit Profile</h1>
                        <p>You need to be signed in to edit your profile.</p>
                    </div>
                </main>

        );
    }

    return (
        <div className="min-h-screen flex flex-col justify-between bg-base-100">
            <main className="container mx-auto py-16 px-4 flex-1">
                <div className="max-w-md mx-auto bg-base-200 p-8 rounded-lg shadow-lg">
                    <h1 className="text-4xl font-bold text-center mb-8">Edit Profile</h1>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1" htmlFor="username">
                                Username
                            </label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                className="input input-bordered w-full"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1" htmlFor="email">
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="input input-bordered w-full"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1" htmlFor="first_name">
                                First Name
                            </label>
                            <input
                                type="text"
                                id="first_name"
                                name="first_name"
                                value={formData.first_name}
                                onChange={handleChange}
                                className="input input-bordered w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1" htmlFor="last_name">
                                Last Name
                            </label>
                            <input
                                type="text"
                                id="last_name"
                                name="last_name"
                                value={formData.last_name}
                                onChange={handleChange}
                                className="input input-bordered w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1" htmlFor="bio">
                                Bio
                            </label>
                            <textarea
                                id="bio"
                                name="bio"
                                value={formData.bio}
                                onChange={handleChange}
                                className="textarea textarea-bordered w-full"
                            />
                        </div>
                        <button type="submit" className="block w-full font-bold py-2 px-4 rounded mt-4 btn btn-primary">
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