/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import toast, { Toaster } from 'react-hot-toast';
import { ClipLoader } from 'react-spinners';
import withAuth from '@/components/Admin/withAuth';

const RoleList = ['admin', 'moderator', 'editor', 'user', 'reader'];

interface User {
    id: number;
    username: string;
    email: string;
    role: string;
    first_name: string;
    last_name: string;
}

const EditUser = () => {
    const [user, setUser] = useState<Partial<User>>({});
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { id } = router.query;

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userSelect = JSON.stringify({
                    id: true,
                    username: true,
                    first_name: true,
                    last_name: true,
                    email: true,
                    role: true,
                });
                const userWhere = JSON.stringify({ id: Number(id) });
                const response = await axios.get(`/api/users?select=${userSelect}&where=${userWhere}`);
                if (response.data.length > 0) {
                    setUser(response.data[0]);
                } else {
                    toast.dismiss();
                    toast.error('User not found');
                }
            } catch (error) {
                toast.dismiss();
                toast.error('Failed to fetch user');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchUser();
        }
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setUser({ ...user, [name]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.put('/api/users', { id, data: user });
            toast.dismiss();
            toast.success('User updated successfully');
            router.push('/admin/users');
        } catch (error) {
            toast.dismiss();
            toast.error('Failed to update user');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <ClipLoader size={50} />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col justify-between bg-light dark:bg-dark text-slate-900">
            <Toaster />
            <main className="container mx-auto py-16 px-4 flex-1">
                <div className="max-w-4xl mx-auto bg-light dark:bg-dark p-8 rounded-lg shadow-lg shadow-slate-300 dark:shadow-slate-800">
                    <h1 className="text-4xl font-bold text-center mb-8 text-slate-800 dark:text-light">Edit User</h1>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="form-control">
                            <label className="label" htmlFor="username">
                                <span className="label-text block mb-1 text-slate-800 dark:text-light font-bold text-lg">Username</span>
                            </label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                value={user.username || ''}
                                onChange={handleChange}
                                className="input input-bordered w-full bg-white text-black dark:bg-dark dark:text-white"
                                required
                            />
                        </div>
                        <div className="form-control">
                            <label className="label" htmlFor="email">
                                <span className="label-text block mb-1 text-slate-800 dark:text-light font-bold text-lg">Email</span>
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={user.email || ''}
                                onChange={handleChange}
                                className="input input-bordered w-full bg-white text-black dark:bg-dark dark:text-white"
                                required
                            />
                        </div>
                        <div className="form-control">
                            <label className="label" htmlFor="first_name">
                                <span className="label-text block mb-1 text-slate-800 dark:text-light font-bold text-lg">First Name</span>
                            </label>
                            <input
                                type="text"
                                id="first_name"
                                name="first_name"
                                value={user.first_name || ''}
                                onChange={handleChange}
                                className="input input-bordered w-full bg-white text-black dark:bg-dark dark:text-white"
                            />
                        </div>
                        <div className="form-control">
                            <label className="label" htmlFor="last_name">
                                <span className="label-text block mb-1 text-slate-800 dark:text-light font-bold text-lg">Last Name</span>
                            </label>
                            <input
                                type="text"
                                id="last_name"
                                name="last_name"
                                value={user.last_name || ''}
                                onChange={handleChange}
                                className="input input-bordered w-full bg-white text-black dark:bg-dark dark:text-white"
                            />
                        </div>
                        <div className="form-control">
                            <label className="label" htmlFor="role">
                                <span className="label-text block mb-1 text-slate-800 dark:text-light font-bold text-lg">Role</span>
                            </label>
                            <select
                                id="role"
                                name="role"
                                value={user.role || ''}
                                onChange={handleChange}
                                className="select select-bordered w-full bg-white text-black dark:bg-dark dark:text-white"
                            >
                                {RoleList.map(role => (
                                    <option key={role} value={role}>
                                        {role}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button type="submit" className="btn btn-primary w-full mt-4">
                            Update User
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default withAuth(EditUser);