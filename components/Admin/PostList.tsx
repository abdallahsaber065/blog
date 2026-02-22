import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Shield, Users } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FaEdit, FaFilter, FaSave, FaSearch, FaTimes, FaTrash, FaUserLock } from 'react-icons/fa';

interface PostPermission {
    id: number;
    post_id: number;
    user_id: number | null;
    role: string | null;
}

interface Post {
    id: number;
    slug: string;
    tags: string[];
    title: string;
    category: { id: number; name: string };
    author: { id: number; username: string; first_name: string; last_name: string };
    created_at: string;
    status: string;
    permissions: PostPermission[];
}

interface PostListProps {
    posts: Post[];
    onSelectPost: (id: number) => void;
    onDeletePost: (id: number) => void;
    setPosts: React.Dispatch<React.SetStateAction<Post[]>>;
}

const ApproveRoles = ['admin', 'moderator'];
const PermissionManageRoles = ['admin', 'moderator'];

const POST_SELECT_FIELDS = {
    id: true,
    slug: true,
    title: true,
    status: true,
    tags: {
        select: {
            id: true,
            name: true,
        },
    },
    created_at: true,
    author: {
        select: {
            id: true,
            username: true,
            first_name: true,
            last_name: true,
        },
    },
    category: {
        select: {
            id: true,
            name: true,
        },
    },
    permissions: {
        select: {
            id: true,
            user_id: true,
            role: true,
        }
    },
};

const PermissionsModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    post: Post;
    onSave: (permissions: { users: number[], roles: string[] }) => Promise<void>;
}> = ({ isOpen, onClose, post, onSave }) => {
    const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
    const [selectedRoles, setSelectedRoles] = useState<string[]>(['admin']);
    const [availableUsers, setAvailableUsers] = useState<Array<{ id: number, username: string, role?: string }>>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (isOpen && post) {
            // Load available users with their roles
            fetch('/api/users')
                .then(res => res.json())
                .then(users => {
                    setAvailableUsers(users);
                    // Auto-select admin users
                    const adminUsers = users.filter((user: { role?: string; id: number }) => user.role === 'admin').map((user: { id: number }) => user.id);
                    setSelectedUsers(prevSelected => [...new Set([...prevSelected, ...adminUsers])]);
                })
                .catch(() => {
                    toast.error('Failed to load users for permissions panel');
                });

            // Set initial selections based on existing permissions
            const userIds = (post.permissions || [])
                .filter(p => p.user_id !== null)
                .map(p => p.user_id!);
            const roles = (post.permissions || [])
                .filter(p => p.role !== null)
                .map(p => p.role!);

            setSelectedUsers(prev => [...new Set([...prev, ...userIds])]);
            setSelectedRoles(prev => [...new Set([...prev, ...roles])]);
        }
    }, [isOpen, post]);

    if (!isOpen) return null;

    const filteredUsers = availableUsers.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleUserToggle = (userId: number, isAdmin: boolean) => {
        if (isAdmin) return; // Prevent toggling admin users
        setSelectedUsers(prev => {
            if (prev.includes(userId)) {
                return prev.filter(id => id !== userId);
            } else {
                return [...prev, userId];
            }
        });
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await onSave({
                users: selectedUsers,
                roles: selectedRoles.includes('admin') ? selectedRoles : ['admin', ...selectedRoles]
            });
            onClose();
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-dark/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 text-slate-900 dark:text-slate-300 animate-fade-in font-mr">
            <div className="bg-white dark:bg-darkSurface rounded-2xl p-7 max-w-md w-full max-h-[85vh] overflow-y-auto shadow-gold/10 border border-lightBorder dark:border-darkBorder relative">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-gold via-goldLight to-gold rounded-t-2xl"></div>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold flex items-center gap-3 text-foreground">
                        <div className="p-2 bg-gold/10 rounded-lg">
                            <FaUserLock className="text-gold" />
                        </div>
                        Permissions
                    </h2>
                    <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0 rounded-full hover:bg-gold/10 hover:text-gold transition-colors">
                        <FaTimes />
                    </Button>
                </div>

                <div className="space-y-6">
                    <div>
                        <h3 className="text-sm font-bold mb-2 text-muted-foreground flex items-center gap-2">
                            <Users className="w-4 h-4 text-gold" />
                            Users
                        </h3>
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full p-2.5 mb-3 rounded-lg bg-light dark:bg-dark border border-lightBorder dark:border-darkBorder focus:ring-2 focus:ring-gold transition-all outline-none text-sm"
                        />
                        <div className="max-h-48 overflow-y-auto border border-lightBorder dark:border-darkBorder rounded-xl p-2 bg-light/50 dark:bg-dark/30 space-y-1">
                            {filteredUsers.map(user => {
                                const isAdmin = user.role === 'admin';
                                return (
                                    <label
                                        key={user.id}
                                        className={`flex items-center space-x-3 p-2 hover:bg-gold/5 dark:hover:bg-gold/10 rounded-lg cursor-pointer transition-colors ${isAdmin ? 'opacity-60 cursor-not-allowed' : ''
                                            }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedUsers.includes(user.id)}
                                            onChange={() => handleUserToggle(user.id, isAdmin)}
                                            disabled={isAdmin}
                                            className="w-4 h-4 rounded border-lightBorder text-gold focus:ring-gold"
                                        />
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-foreground">{user.username}</span>
                                            {isAdmin && <span className="text-[10px] text-gold font-bold uppercase tracking-wider">Admin</span>}
                                        </div>
                                    </label>
                                );
                            })}
                        </div>
                    </div>

                    <div className="space-y-3 pt-2">
                        <h3 className="text-sm font-bold text-muted-foreground flex items-center gap-2">
                            <Shield className="w-4 h-4 text-gold" />
                            Grant by Global Roles
                        </h3>
                        <div className="grid grid-cols-1 gap-2">
                            {['admin', 'moderator', 'editor'].map(role => (
                                <label
                                    key={role}
                                    className={`flex items-center space-x-3 p-3 border rounded-xl cursor-pointer transition-all duration-200 ${selectedRoles.includes(role)
                                        ? 'border-gold bg-gold/5 dark:bg-gold/10 ring-1 ring-gold/20'
                                        : 'border-lightBorder dark:border-darkBorder hover:border-gold/40 hover:bg-gold/5'
                                        } ${role === 'admin' ? 'opacity-80' : ''}`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedRoles.includes(role)}
                                        onChange={(e) => {
                                            if (role === 'admin') return; // Prevent changing admin role
                                            if (e.target.checked) {
                                                setSelectedRoles([...selectedRoles, role]);
                                            } else {
                                                setSelectedRoles(selectedRoles.filter(r => r !== role));
                                            }
                                        }}
                                        disabled={role === 'admin'}
                                        className="w-4 h-4 rounded border-lightBorder text-gold focus:ring-gold"
                                    />
                                    <div className="flex items-center justify-between flex-1">
                                        <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                                            {role}
                                        </span>
                                        {role === 'admin' && <span className="text-[10px] text-muted-foreground/60 font-medium italic">(Always included)</span>}
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-lightBorder dark:border-darkBorder">
                    <Button
                        onClick={onClose}
                        variant="ghost"
                        disabled={loading}
                        className="flex-1 font-bold h-11 border border-lightBorder dark:border-darkBorder"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex-1 bg-gold hover:bg-goldDark text-dark font-bold h-11 shadow-gold hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

const PostList: React.FC<PostListProps> = ({ posts, onSelectPost, onDeletePost, setPosts }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const [postsPerPage, setPostsPerPage] = useState(10);
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [showAll, setShowAll] = useState(false);
    const [advancedSearch, setAdvancedSearch] = useState(false);
    const [authorFilter, setAuthorFilter] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [editingPostId, setEditingPostId] = useState<number | null>(null);
    const [editedStatus, setEditedStatus] = useState<string>('');
    const [savingPostIds, setSavingPostIds] = useState<Set<number>>(new Set());
    const [deletingPostIds, setDeletingPostIds] = useState<Set<number>>(new Set());
    const [selectedPostForPermissions, setSelectedPostForPermissions] = useState<Post | null>(null);
    const { data: session, status } = useSession();
    const canManagePermissions = session?.user?.role && PermissionManageRoles.includes(session.user.role);
    const currentUserId = Number(session?.user?.id);
    const currentUserRole = session?.user?.role;

    const deleteRoles = ['admin'];

    const hasApproveRights = session?.user?.role ? ApproveRoles.includes(session.user.role) : false;

    const getNextStatus = (currentStatus: string, isApprover: boolean): string => {
        if (isApprover) {
            // Admins/moderators cycle: draft -> pending -> published -> draft
            switch (currentStatus) {
                case 'draft':
                    return 'pending';
                case 'pending':
                    return 'published';
                case 'published':
                    return 'draft';
                default:
                    return 'draft';
            }
        } else {
            // Authors cycle: draft -> pending -> draft
            switch (currentStatus) {
                case 'draft':
                    return 'pending';
                case 'pending':
                case 'published':
                    return 'draft';
                default:
                    return 'draft';
            }
        }
    };

    if (!Array.isArray(posts)) {
        return <div>Error: posts is not an array</div>;
    }

    const filteredPosts = posts.filter(post => {
        const matchesSearchTerm = post.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'All' || post.category?.name === categoryFilter;
        const matchesAuthor = !authorFilter ||
            post.author?.first_name?.toLowerCase().includes(authorFilter.toLowerCase()) ||
            post.author?.last_name?.toLowerCase().includes(authorFilter.toLowerCase());
        const matchesDate = !dateFilter || post.created_at.includes(dateFilter);
        return matchesSearchTerm && matchesCategory && matchesAuthor && matchesDate;
    });

    const sortedPosts = filteredPosts.sort((a, b) => {
        if (!hasApproveRights) {
            if (a.author?.id === currentUserId && b.author?.id !== currentUserId) return -1;
            if (a.author?.id !== currentUserId && b.author?.id === currentUserId) return 1;
        }

        if (sortOrder === 'asc') {
            return a.title.localeCompare(b.title);
        } else {
            return b.title.localeCompare(a.title);
        }
    });

    const paginatedPosts = showAll ? sortedPosts : sortedPosts.slice(
        (currentPage - 1) * postsPerPage,
        currentPage * postsPerPage
    );

    const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

    const handleStatusChange = async (post: Post) => {
        try {
            const nextStatus = getNextStatus(post.status, hasApproveRights);

            if (nextStatus === 'published' && !hasApproveRights) {
                toast.dismiss();
                toast.error('You do not have permission to publish posts');
                return;
            }

            setSavingPostIds(prev => new Set(prev).add(post.id));
            const response = await fetch(`/api/posts?id=${post.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    data: { status: nextStatus },
                    id: post.id,
                }),
            });
            if (response.ok) {
                toast.dismiss();
                const statusText = nextStatus === 'published' ? 'published' : nextStatus === 'pending' ? 'submitted for review' : 'saved as draft';
                toast.success(`Post ${statusText}`);
                setEditingPostId(null);
                setEditedStatus('');
                const updatedPosts = posts.map(p =>
                    p.id === post.id ? { ...p, status: nextStatus } : p
                );
                setPosts(updatedPosts);
            } else {
                toast.dismiss();
                toast.error('Failed to update status');
            }
        } catch (error) {
            toast.dismiss();
            toast.error('Failed to update status');
        } finally {
            setSavingPostIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(post.id);
                return newSet;
            });
        }
    };

    const handleDeletePost = async (postId: number) => {
        if (!((session?.user?.role && deleteRoles.includes(session.user.role)) ||
            Number(session?.user?.id) === posts.find(p => p.id === postId)?.author.id)) {
            toast.dismiss();
            toast.error('You do not have permission to delete this post.');
            return;
        }

        try {
            setDeletingPostIds(prev => new Set(prev).add(postId));
            await onDeletePost(postId);
            toast.dismiss();
            toast.success('Post deleted successfully');
        } catch (error) {
            toast.dismiss();
            toast.error('Failed to delete post');
        } finally {
            setDeletingPostIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(postId);
                return newSet;
            });
        }
    };

    const handlePermissionsSave = async (postId: number, permissions: { users: number[], roles: string[] }) => {
        try {
            const response = await fetch(`/api/posts/${postId}/permissions`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(permissions),
            });

            if (response.ok) {
                toast.success('Permissions updated successfully');

                // Use the constant select fields
                const updatedPosts = await fetch('/api/posts?select=' + JSON.stringify(POST_SELECT_FIELDS))
                    .then(res => res.json());
                setPosts(updatedPosts);
            } else {
                toast.error('Failed to update permissions');
            }
        } catch (error) {
            toast.error('Failed to update permissions');
        }
    };

    // Helper function to check if a post is being processed
    const isPostProcessing = (postId: number) => {
        return savingPostIds.has(postId) || deletingPostIds.has(postId);
    };

    const hasPermissionForPost = (post: Post) => {
        // Admin/moderator has full access
        if (ApproveRoles.includes(currentUserRole || '')) {
            return true;
        }

        // Author has access
        if (post.author?.id === currentUserId) {
            return true;
        }

        // Check user-specific permission
        const hasUserPermission = post.permissions?.some(p => p.user_id === currentUserId);
        if (hasUserPermission) {
            return true;
        }

        // Check role-based permission
        const hasRolePermission = post.permissions?.some(p => p.role === currentUserRole);
        if (hasRolePermission) {
            return true;
        }

        return false;
    };

    return (
        <div className="space-y-4">
            {/* Search and Filter Bar */}
            <div className="flex flex-col md:flex-row gap-3 flex-wrap bg-white dark:bg-darkSurface p-4 rounded-xl border border-lightBorder dark:border-darkBorder shadow-sm">
                <div className="relative flex-1 min-w-[200px]">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Search posts..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-light dark:bg-dark border-lightBorder dark:border-darkBorder focus:border-gold"
                    />
                </div>
                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-md bg-white dark:bg-dark text-foreground focus:ring-2 focus:ring-gold focus:border-gold dark:focus:ring-gold transition-all duration-200"
                >
                    <option value="All">All Categories</option>
                    {Array.from(new Set(posts.map(post => post.category ? post.category.name : 'Unknown')))
                        .filter((category: string) => category !== 'Unknown')
                        .map((category: string) => (
                            <option key={category} value={category}>{category}</option>
                        ))}
                </select>
                <Button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    variant="outline"
                    className="whitespace-nowrap border-lightBorder dark:border-darkBorder hover:bg-gold/10 hover:text-gold hover:border-gold/50"
                >
                    Sort {sortOrder === 'asc' ? '↓' : '↑'}
                </Button>
                <Button
                    onClick={() => setShowAll(!showAll)}
                    variant="outline"
                    className="whitespace-nowrap border-lightBorder dark:border-darkBorder hover:bg-gold/10 hover:text-gold hover:border-gold/50"
                >
                    {showAll ? 'Paginate' : 'Show All'}
                </Button>
                <select
                    value={postsPerPage}
                    onChange={(e) => setPostsPerPage(Number(e.target.value))}
                    className="px-3 py-2 border border-lightBorder dark:border-darkBorder rounded-md bg-white dark:bg-dark text-foreground focus:ring-2 focus:ring-gold focus:border-gold dark:focus:ring-gold transition-all duration-200"
                >
                    {[5, 10, 20, 50].map(number => (
                        <option key={number} value={number}>{number} per page</option>
                    ))}
                </select>
                <Button
                    onClick={() => setAdvancedSearch(!advancedSearch)}
                    variant="outline"
                    className="whitespace-nowrap border-lightBorder dark:border-darkBorder hover:bg-gold/10 hover:text-gold hover:border-gold/50"
                >
                    <FaFilter className="mr-2" />
                    {advancedSearch ? 'Hide Filters' : 'More Filters'}
                </Button>
            </div>
            {advancedSearch && (
                <div className="p-4 border border-lightBorder dark:border-darkBorder rounded-lg bg-light dark:bg-darkSurface/50 space-y-3 animate-slide-up">
                    <Input
                        type="text"
                        placeholder="Filter by author..."
                        value={authorFilter}
                        onChange={(e) => setAuthorFilter(e.target.value)}
                        className="bg-light dark:bg-dark border-lightBorder dark:border-darkBorder"
                    />
                    <Input
                        type="date"
                        placeholder="Filter by date..."
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="bg-light dark:bg-dark border-lightBorder dark:border-darkBorder"
                    />
                </div>
            )}
            <div className="rounded-lg border border-lightBorder dark:border-darkBorder overflow-hidden bg-white dark:bg-darkSurface shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-lightBorder dark:border-darkBorder bg-light dark:bg-dark">
                                <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">
                                    Title
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground hidden md:table-cell">
                                    Author
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground hidden lg:table-cell">
                                    Category
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">
                                    Status
                                </th>
                                <th className="px-4 py-3 text-right text-sm font-semibold text-muted-foreground">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedPosts.map((post, index) => (
                                <tr
                                    key={post.id}
                                    className={`border-b border-lightBorder dark:border-darkBorder hover:bg-gold/5 dark:hover:bg-gold/10 transition-all duration-200 group ${index === paginatedPosts.length - 1 ? 'border-b-0' : ''
                                        }`}
                                >
                                    <td className="px-4 py-4">
                                        <div className="flex flex-col space-y-1">
                                            <Link
                                                className="text-gold hover:text-goldDark dark:text-goldLight dark:hover:text-gold font-medium hover:underline transition-all duration-200 line-clamp-2"
                                                href={post.status === 'published' ? `/blogs/${post.slug}` : `/blogs/preview/${post.slug}`}
                                                target="_blank"
                                            >
                                                {post.title}
                                            </Link>
                                            <span className="text-xs text-muted-foreground/70 md:hidden">
                                                by {post.author?.first_name} {post.author?.last_name}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 hidden md:table-cell">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-foreground">
                                                {post.author?.first_name} {post.author?.last_name}
                                            </span>
                                            <span className="text-xs text-muted-foreground/70">
                                                @{post.author?.username}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 hidden lg:table-cell">
                                        <Badge variant="outline" className="font-normal">
                                            {post.category?.name || 'Uncategorized'}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-2">
                                            {(hasApproveRights || post.author?.id === currentUserId) && (
                                                <button
                                                    onClick={() => handleStatusChange(post)}
                                                    disabled={savingPostIds.has(post.id)}
                                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none border ${post.status === 'published'
                                                        ? 'bg-green-500 border-green-600'
                                                        : post.status === 'pending'
                                                            ? 'bg-yellow-500 border-yellow-600'
                                                            : 'bg-muted/30 dark:bg-dark border-lightBorder dark:border-darkBorder'
                                                        } ${savingPostIds.has(post.id) ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80 cursor-pointer'}`}
                                                    title={`Click to cycle status (${getNextStatus(post.status, hasApproveRights)})`}
                                                    aria-label="Toggle post status"
                                                >
                                                    <span
                                                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${post.status === 'published'
                                                            ? 'translate-x-6'
                                                            : post.status === 'pending'
                                                                ? 'translate-x-3'
                                                                : 'translate-x-1'
                                                            }`}
                                                    />
                                                </button>
                                            )}
                                            <Badge
                                                variant={post.status === 'published' ? 'default' : post.status === 'pending' ? 'secondary' : 'outline'}
                                                className={`text-xs ${post.status === 'published'
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-200 dark:border-green-800'
                                                    : post.status === 'pending'
                                                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800'
                                                        : 'bg-muted/10 text-muted-foreground border-lightBorder dark:border-darkBorder'
                                                    }`}
                                            >
                                                {post.status === 'pending' && !hasApproveRights
                                                    ? 'Waiting'
                                                    : post.status}
                                            </Badge>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        {hasPermissionForPost(post) && (
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-8 w-8 p-0 text-muted-foreground hover:text-gold hover:bg-gold/10 dark:hover:bg-gold/15 transition-all duration-200"
                                                    onClick={() => onSelectPost(post.id)}
                                                    disabled={isPostProcessing(post.id)}
                                                    title="Edit Post"
                                                >
                                                    <FaEdit className="w-3.5 h-3.5" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-8 w-8 p-0 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                                                    onClick={() => handleDeletePost(post.id)}
                                                    disabled={isPostProcessing(post.id)}
                                                    title="Delete Post"
                                                >
                                                    {deletingPostIds.has(post.id) ? (
                                                        <span className="text-[10px]">...</span>
                                                    ) : (
                                                        <FaTrash className="w-3.5 h-3.5" />
                                                    )}
                                                </Button>
                                                {canManagePermissions && (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-8 w-8 p-0 text-muted-foreground hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950"
                                                        onClick={() => setSelectedPostForPermissions(post)}
                                                        disabled={isPostProcessing(post.id)}
                                                        title="Manage Permissions"
                                                    >
                                                        <FaUserLock className="w-3.5 h-3.5" />
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {!showAll && (
                <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4 border-t border-lightBorder dark:border-darkBorder">
                    <Button
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        variant="outline"
                        className="w-full sm:w-auto"
                    >
                        ← Previous
                    </Button>
                    <span className="text-sm font-medium text-muted-foreground">
                        Page {currentPage} of {totalPages}
                    </span>
                    <Button
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        variant="outline"
                        className="w-full sm:w-auto"
                    >
                        Next →
                    </Button>
                </div>
            )}

            {canManagePermissions && (
                <PermissionsModal
                    isOpen={!!selectedPostForPermissions}
                    onClose={() => setSelectedPostForPermissions(null)}
                    post={selectedPostForPermissions!}
                    onSave={(permissions) => {
                        if (selectedPostForPermissions) {
                            return handlePermissionsSave(selectedPostForPermissions.id, permissions);
                        }
                        return Promise.resolve();
                    }}
                />
            )}
        </div>
    );
};

export default PostList;
