// pages/admin/users/create.tsx
import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import toast, { Toaster } from 'react-hot-toast';
import withAuth from '@/components/Admin/withAuth';

const RoleList = ['admin', 'moderator', 'editor', 'user', 'reader'];

const CreateUser = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        role: 'reader',
    });
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post('/api/users', formData);
            toast.dismiss();
            toast.success('User created successfully');
            router.push('/admin/users');
        } catch (error) {
            toast.dismiss();
            toast.error('Failed to create user');
        }
    };

    return (
        <div className="min-h-screen flex flex-col justify-between bg-light dark:bg-dark text-slate-900">
            <Toaster />
            <main className="container mx-auto py-16 px-4 flex-1">
                <div className="max-w-4xl mx-auto bg-light dark:bg-dark p-8 rounded-lg shadow-lg shadow-slate-300 dark:shadow-slate-800">
                    <h1 className="text-4xl font-bold text-center mb-8 text-slate-800 dark:text-light">Create New User</h1>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="form-control">
                            <label className="label" htmlFor="username">
                                <span className="label-text block mb-1 text-slate-600 dark:text-slate-300 font-semibold text-sm uppercase tracking-wider">Username</span>
                            </label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                className="input input-bordered w-full bg-slate-200 dark:bg-gray text-slate-900 dark:text-slate-100 font-medium"
                                required
                            />
                        </div>
                        <div className="form-control">
                            <label className="label" htmlFor="email">
                                <span className="label-text block mb-1 text-slate-600 dark:text-slate-300 font-semibold text-sm uppercase tracking-wider">Email</span>
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="input input-bordered w-full bg-slate-200 dark:bg-gray text-slate-900 dark:text-slate-100 font-medium"
                                required
                            />
                        </div>
                        <div className="form-control">
                            <label className="label" htmlFor="password">
                                <span className="label-text block mb-1 text-slate-600 dark:text-slate-300 font-semibold text-sm uppercase tracking-wider">Password</span>
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="input input-bordered w-full bg-slate-200 dark:bg-gray text-slate-900 dark:text-slate-100 font-medium"
                                required
                            />
                        </div>
                        <div className="form-control">
                            <label className="label" htmlFor="first_name">
                                <span className="label-text block mb-1 text-slate-600 dark:text-slate-300 font-semibold text-sm uppercase tracking-wider">First Name</span>
                            </label>
                            <input
                                type="text"
                                id="first_name"
                                name="first_name"
                                value={formData.first_name}
                                onChange={handleChange}
                                className="input input-bordered w-full bg-slate-200 dark:bg-gray text-slate-900 dark:text-slate-100 font-medium"
                            />
                        </div>
                        <div className="form-control">
                            <label className="label" htmlFor="last_name">
                                <span className="label-text block mb-1 text-slate-600 dark:text-slate-300 font-semibold text-sm uppercase tracking-wider">Last Name</span>
                            </label>
                            <input
                                type="text"
                                id="last_name"
                                name="last_name"
                                value={formData.last_name}
                                onChange={handleChange}
                                className="input input-bordered w-full bg-slate-200 dark:bg-gray text-slate-900 dark:text-slate-100 font-medium"
                            />
                        </div>
                        <div className="form-control">
                            <label className="label" htmlFor="role">
                                <span className="label-text block mb-1 text-slate-600 dark:text-slate-300 font-semibold text-sm uppercase tracking-wider">Role</span>
                            </label>
                            <select
                                id="role"
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="select select-bordered w-full bg-slate-300 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                            >
                                {RoleList.map(role => (
                                    <option key={role} value={role}>
                                        {role}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button type="submit" className="btn btn-primary w-full mt-4">
                            Create User
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default withAuth(CreateUser);