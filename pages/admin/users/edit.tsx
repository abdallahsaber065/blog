/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import toast, { Toaster } from 'react-hot-toast';
import { ClipLoader } from 'react-spinners';
import withAuth from '@/components/Admin/withAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserCog, Mail, User, Shield, Loader2, Save } from 'lucide-react';

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
    const [isSubmitting, setIsSubmitting] = useState(false);
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
        setIsSubmitting(true);
        try {
            await axios.put('/api/users', { id, data: user });
            toast.dismiss();
            toast.success('User updated successfully');
            router.push('/admin/users');
        } catch (error) {
            toast.dismiss();
            toast.error('Failed to update user');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-600 dark:text-blue-400" />
                    <p className="text-slate-600 dark:text-slate-400">Loading user data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
            <Toaster />
            
            {/* Hero Section */}
            <section className="relative px-5 sm:px-10 md:px-24 sxl:px-32 py-12 md:py-16 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border-b border-slate-200 dark:border-slate-800">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-start gap-4">
                        <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                            <UserCog className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                                Edit User
                            </h1>
                            <p className="text-lg text-slate-600 dark:text-slate-400">
                                Update user information and permissions
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8 md:py-12 max-w-3xl">
                <Card>
                    <CardHeader>
                        <CardTitle>User Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Username */}
                            <div className="space-y-2">
                                <Label htmlFor="username" className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                    Username *
                                </Label>
                                <Input
                                    type="text"
                                    id="username"
                                    name="username"
                                    value={user.username || ''}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter username"
                                />
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <Label htmlFor="email" className="flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                    Email *
                                </Label>
                                <Input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={user.email || ''}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter email address"
                                />
                            </div>

                            {/* First Name */}
                            <div className="space-y-2">
                                <Label htmlFor="first_name">First Name</Label>
                                <Input
                                    type="text"
                                    id="first_name"
                                    name="first_name"
                                    value={user.first_name || ''}
                                    onChange={handleChange}
                                    placeholder="Enter first name"
                                />
                            </div>

                            {/* Last Name */}
                            <div className="space-y-2">
                                <Label htmlFor="last_name">Last Name</Label>
                                <Input
                                    type="text"
                                    id="last_name"
                                    name="last_name"
                                    value={user.last_name || ''}
                                    onChange={handleChange}
                                    placeholder="Enter last name"
                                />
                            </div>

                            {/* Role */}
                            <div className="space-y-2">
                                <Label htmlFor="role" className="flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                    Role
                                </Label>
                                <select
                                    id="role"
                                    name="role"
                                    value={user.role || ''}
                                    onChange={handleChange}
                                    className="flex h-10 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:ring-offset-slate-950 dark:placeholder:text-slate-400"
                                >
                                    {RoleList.map(role => (
                                        <option key={role} value={role}>
                                            {role.charAt(0).toUpperCase() + role.slice(1)}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Assign appropriate permissions to this user
                                </p>
                            </div>

                            {/* Submit Buttons */}
                            <div className="flex gap-4 pt-4">
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Updating User...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4 mr-2" />
                                            Update User
                                        </>
                                    )}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.push('/admin/users')}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
};

export default withAuth(EditUser);