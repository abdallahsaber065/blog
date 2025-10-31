// pages/admin/users/index.tsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import toast, { Toaster } from 'react-hot-toast';
import withAuth from '@/components/Admin/withAuth';
import UserList from '@/components/Admin/Users/UserList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
    Users, 
    UserPlus, 
    Mail, 
    Search, 
    Shield, 
    Loader2,
    UserCog,
    Filter
} from 'lucide-react';
import Link from 'next/link';

// Standard select input styling matching the project's design system
const SELECT_INPUT_CLASSNAME = "flex h-10 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:ring-offset-slate-950";

interface User {
    id: number;
    username: string;
    email: string;
    role: string;
    first_name: string;
    last_name: string;
    posts: number;
}

interface UserApiResponse {
    id: number;
    username: string;
    email: string;
    role: string;
    first_name: string;
    last_name: string;
    posts: Array<{ id: number }>;
}

const UsersManagementPage = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const router = useRouter();

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        filterUsers();
    }, [searchTerm, roleFilter, users]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const userSelect = JSON.stringify({
                id: true,
                username: true,
                first_name: true,
                last_name: true,
                email: true,
                role: true,
                posts: {
                    select: {
                        id: true
                    }
                }
            });
            const response = await axios.get<UserApiResponse[]>(`/api/users?select=${userSelect}`);
            const usersWithPostCount: User[] = response.data.map((user) => ({
                ...user,
                posts: user.posts?.length || 0
            }));
            setUsers(usersWithPostCount);
            setFilteredUsers(usersWithPostCount);
        } catch (error) {
            toast.dismiss();
            toast.error('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const filterUsers = () => {
        let filtered = users;

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(user => 
                user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filter by role
        if (roleFilter !== 'all') {
            filtered = filtered.filter(user => user.role === roleFilter);
        }

        setFilteredUsers(filtered);
    };

    const getRoleCount = (role: string) => {
        return users.filter(user => user.role === role).length;
    };

    const handleCreateUser = () => {
        router.push('/admin/users/create');
    };

    const hasActiveFilters = searchTerm || roleFilter !== 'all';

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
            <Toaster />
            
            {/* Hero Section */}
            <section className="relative px-5 sm:px-10 md:px-24 sxl:px-32 py-12 md:py-16 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border-b border-slate-200 dark:border-slate-800">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div className="flex items-start gap-4">
                            <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                                <Users className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                                    User Management
                                </h1>
                                <p className="text-lg text-slate-600 dark:text-slate-400">
                                    Manage and oversee all user accounts
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <Link href="/admin/users/create">
                                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
                                    <UserPlus className="w-5 h-5 mr-2" />
                                    Create User
                                </Button>
                            </Link>
                            <Link href="/admin/users/subscriptions">
                                <Button variant="secondary" size="lg">
                                    <Mail className="w-5 h-5 mr-2" />
                                    Subscriptions
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8 md:py-12 max-w-7xl">
                {/* Statistics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total Users</p>
                                    <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                                        {users.length}
                                    </p>
                                </div>
                                <Users className="w-12 h-12 text-blue-600 dark:text-blue-400 opacity-20" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Admins</p>
                                    <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                                        {getRoleCount('admin')}
                                    </p>
                                </div>
                                <Shield className="w-12 h-12 text-purple-600 dark:text-purple-400 opacity-20" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Moderators</p>
                                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                                        {getRoleCount('moderator')}
                                    </p>
                                </div>
                                <UserCog className="w-12 h-12 text-green-600 dark:text-green-400 opacity-20" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Editors</p>
                                    <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                                        {getRoleCount('editor')}
                                    </p>
                                </div>
                                <UserCog className="w-12 h-12 text-orange-600 dark:text-orange-400 opacity-20" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Search and Filter */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="w-5 h-5" />
                            Search & Filter
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    type="text"
                                    placeholder="Search by username, email, or name..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <div className="w-full md:w-48">
                                <select
                                    value={roleFilter}
                                    onChange={(e) => setRoleFilter(e.target.value)}
                                    className={SELECT_INPUT_CLASSNAME}
                                >
                                    <option value="all">All Roles</option>
                                    <option value="admin">Admin</option>
                                    <option value="moderator">Moderator</option>
                                    <option value="editor">Editor</option>
                                    <option value="user">User</option>
                                    <option value="reader">Reader</option>
                                </select>
                            </div>
                        </div>
                        {hasActiveFilters && (
                            <div className="mt-4 flex items-center gap-2">
                                <Badge variant="secondary">
                                    {filteredUsers.length} {filteredUsers.length === 1 ? 'result' : 'results'} found
                                </Badge>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setSearchTerm('');
                                        setRoleFilter('all');
                                    }}
                                >
                                    Clear filters
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Users List */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Users List</CardTitle>
                            <Badge variant="secondary">{filteredUsers.length} users</Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <Loader2 className="w-12 h-12 animate-spin text-blue-600 dark:text-blue-400 mb-4" />
                                <p className="text-slate-600 dark:text-slate-400">Loading users...</p>
                            </div>
                        ) : filteredUsers.length === 0 ? (
                            <div className="text-center py-12">
                                <Users className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                                    No users found
                                </h3>
                                <p className="text-slate-600 dark:text-slate-400 mb-4">
                                    {hasActiveFilters 
                                        ? 'Try adjusting your search or filter criteria'
                                        : 'Get started by creating your first user'}
                                </p>
                                {!hasActiveFilters && (
                                    <Button onClick={handleCreateUser}>
                                        <UserPlus className="w-4 h-4 mr-2" />
                                        Create First User
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <UserList users={filteredUsers} setUsers={setUsers} loading={loading} />
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    );
};

export default withAuth(UsersManagementPage, ['admin']);
