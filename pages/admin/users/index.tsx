// pages/admin/users/index.tsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
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
const SELECT_INPUT_CLASSNAME = "flex h-10 w-full rounded-md border border-lightBorder dark:border-darkBorder bg-white dark:bg-dark px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:ring-offset-dark/50";

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
        <div className="min-h-screen bg-light dark:bg-dark">

            {/* Hero Section */}
            <section className="relative px-5 sm:px-10 md:px-24 sxl:px-32 py-12 md:py-16 bg-light dark:bg-dark border-b border-lightBorder dark:border-darkBorder overflow-hidden">
                {/* Decorative blooms for "Gold Bloom" effect */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold/[0.08] rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
                <div className="absolute -bottom-24 -left-24 w-[400px] h-[400px] bg-gold/[0.05] rounded-full blur-[100px] pointer-events-none"></div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div className="flex items-start gap-4">
                            <div className="p-4 bg-gradient-to-br from-gold to-goldDark rounded-2xl shadow-gold shrink-0">
                                <Users className="w-8 h-8 text-dark" />
                            </div>
                            <div>
                                <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
                                    User Directory
                                </h1>
                                <p className="text-lg text-muted-foreground font-medium">
                                    Manage and oversee all user accounts
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <Link href="/admin/users/create">
                                <Button size="lg" className="bg-gold hover:bg-goldDark dark:bg-gold dark:hover:bg-goldDark text-dark font-bold shadow-gold">
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
            <main className="container mx-auto px-4 py-8 md:py-12 max-w-7xl relative z-10">
                {/* Statistics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <Card className="bg-white dark:bg-darkSurface border-lightBorder dark:border-darkBorder shadow-card dark:shadow-card-dark overflow-hidden group hover:border-gold/30 transition-all duration-300">
                        <div className="absolute top-0 left-0 w-1 h-full bg-gold opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground mb-1">Total Users</p>
                                    <p className="text-3xl font-bold text-foreground">
                                        {users.length}
                                    </p>
                                </div>
                                <div className="p-3 bg-gold/10 rounded-xl">
                                    <Users className="w-6 h-6 text-gold" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white dark:bg-darkSurface border-lightBorder dark:border-darkBorder shadow-card dark:shadow-card-dark overflow-hidden group hover:border-gold/30 transition-all duration-300">
                        <div className="absolute top-0 left-0 w-1 h-full bg-gold opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground mb-1">Admins</p>
                                    <p className="text-3xl font-bold text-gold">
                                        {getRoleCount('admin')}
                                    </p>
                                </div>
                                <div className="p-3 bg-gold/10 rounded-xl">
                                    <Shield className="w-6 h-6 text-gold" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white dark:bg-darkSurface border-lightBorder dark:border-darkBorder shadow-card dark:shadow-card-dark overflow-hidden group hover:border-gold/30 transition-all duration-300">
                        <div className="absolute top-0 left-0 w-1 h-full bg-gold opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground mb-1">Moderators</p>
                                    <p className="text-3xl font-bold text-goldLight">
                                        {getRoleCount('moderator')}
                                    </p>
                                </div>
                                <div className="p-3 bg-gold/10 rounded-xl">
                                    <UserCog className="w-6 h-6 text-goldLight" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white dark:bg-darkSurface border-lightBorder dark:border-darkBorder shadow-card dark:shadow-card-dark overflow-hidden group hover:border-gold/30 transition-all duration-300">
                        <div className="absolute top-0 left-0 w-1 h-full bg-gold opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground mb-1">Editors</p>
                                    <p className="text-3xl font-bold text-goldLight">
                                        {getRoleCount('editor')}
                                    </p>
                                </div>
                                <div className="p-3 bg-gold/10 rounded-xl">
                                    <UserCog className="w-6 h-6 text-goldLight" />
                                </div>
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
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
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
                                <Loader2 className="w-12 h-12 animate-spin text-gold dark:text-goldLight mb-4" />
                                <p className="text-muted-foreground">Loading users...</p>
                            </div>
                        ) : filteredUsers.length === 0 ? (
                            <div className="text-center py-12">
                                <Users className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-foreground mb-2">
                                    No users found
                                </h3>
                                <p className="text-muted-foreground mb-4">
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
