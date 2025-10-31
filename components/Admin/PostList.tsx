import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
            fetch('/api/users').then(res => res.json()).then(users => {
                setAvailableUsers(users);
                // Auto-select admin users
                const adminUsers = users.filter((user: { role?: string; id: number }) => user.role === 'admin').map((user: { id: number }) => user.id);
                setSelectedUsers(prevSelected => [...new Set([...prevSelected, ...adminUsers])]);
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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 text-slate-900 dark:text-slate-300">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
                <h2 className="text-xl font-bold mb-4">Manage Permissions</h2>

                <div className="mb-4">
                    <h3 className="font-semibold mb-2">Users</h3>
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-2 mb-2 border rounded dark:bg-slate-700 dark:border-slate-600"
                    />
                    <div className="max-h-48 overflow-y-auto border rounded p-2 dark:border-slate-600">
                        {filteredUsers.map(user => {
                            const isAdmin = user.role === 'admin';
                            return (
                                <label
                                    key={user.id}
                                    className={`flex items-center space-x-2 p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded
                                        ${isAdmin ? 'opacity-75' : ''}`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedUsers.includes(user.id)}
                                        onChange={() => handleUserToggle(user.id, isAdmin)}
                                        disabled={isAdmin}
                                        className="rounded"
                                    />
                                    <span>
                                        {user.username}
                                        {isAdmin && <span className="ml-2 text-xs text-slate-500">(Admin)</span>}
                                    </span>
                                </label>
                            );
                        })}
                    </div>
                </div>

                <div className="mb-4">
                    <h3 className="font-semibold mb-2">Roles</h3>
                    {['admin', 'moderator', 'editor'].map(role => (
                        <label
                            key={role}
                            className={`flex items-center space-x-2 p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded
                                ${role === 'admin' ? 'opacity-75' : ''}`}
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
                                className="rounded"
                            />
                            <span className="capitalize">
                                {role}
                                {role === 'admin' && <span className="ml-2 text-xs text-slate-500">(Required)</span>}
                            </span>
                        </label>
                    ))}
                </div>

                <div className="flex justify-end space-x-2">
                    <Button
                        onClick={onClose}
                        variant="outline"
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                    >
                        {loading ? 'Saving...' : 'Save'}
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

    const hasApproveRights = session?.user?.role && ApproveRoles.includes(session.user.role);

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

    const handleSaveStatus = async (postId: number) => {
        try {
            if (editedStatus === 'published' && !hasApproveRights) {
                toast.dismiss();
                toast.error('You do not have permission to publish posts');
                return;
            }

            setSavingPostIds(prev => new Set(prev).add(postId));
            const response = await fetch(`/api/posts?id=${postId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    data: { status: editedStatus },
                    id: postId,
                }),
            });
            if (response.ok) {
                toast.dismiss();
                toast.success('Status updated successfully');
                setEditingPostId(null);
                setEditedStatus('');
                const updatedPosts = posts.map(post =>
                    post.id === postId ? { ...post, status: editedStatus } : post
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
                newSet.delete(postId);
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
            <div className="flex flex-col md:flex-row gap-3 flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                    <Input
                        type="text"
                        placeholder="Search posts..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
                    variant="secondary"
                    className="whitespace-nowrap"
                >
                    Sort {sortOrder === 'asc' ? '↓' : '↑'}
                </Button>
                <Button
                    onClick={() => setShowAll(!showAll)}
                    variant="secondary"
                    className="whitespace-nowrap"
                >
                    {showAll ? 'Paginate' : 'Show All'}
                </Button>
                <select
                    value={postsPerPage}
                    onChange={(e) => setPostsPerPage(Number(e.target.value))}
                    className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                    {[5, 10, 20, 50].map(number => (
                        <option key={number} value={number}>{number} per page</option>
                    ))}
                </select>
                <Button
                    onClick={() => setAdvancedSearch(!advancedSearch)}
                    variant="outline"
                    className="whitespace-nowrap"
                >
                    <FaFilter className="mr-2" />
                    {advancedSearch ? 'Hide Filters' : 'More Filters'}
                </Button>
            </div>
            {advancedSearch && (
                <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50 space-y-3">
                    <Input
                        type="text"
                        placeholder="Filter by author..."
                        value={authorFilter}
                        onChange={(e) => setAuthorFilter(e.target.value)}
                    />
                    <Input
                        type="date"
                        placeholder="Filter by date..."
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                    />
                </div>
            )}
            <ul className="space-y-3">
                {paginatedPosts.map((post) => (
                    <li key={post.id} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800/50 hover:shadow-md transition-shadow">
                        <div className="flex flex-col w-full md:w-1/2 space-y-1">
                            <Link className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium hover:underline transition-colors"
                                href={post.status === 'published' ? `/blogs/${post.slug}` : `/blogs/preview/${post.slug}`}
                                target="_blank">
                                {post.title}
                            </Link>
                            <div className="text-sm text-slate-600 dark:text-slate-400">
                                by <span className="font-medium">{post.author?.first_name} {post.author?.last_name}</span>
                                <span className="text-slate-400 dark:text-slate-500">
                                    {' '}(@{post.author?.username})
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
                            <div className="flex items-center gap-2">
                                {editingPostId === post.id ? (
                                    <>
                                        {(hasApproveRights || post.author?.id === currentUserId) && (
                                            <>
                                                <select
                                                    value={editedStatus}
                                                    onChange={(e) => setEditedStatus(e.target.value)}
                                                    className="px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 transition-colors"
                                                    disabled={isPostProcessing(post.id)}
                                                >
                                                    {(hasApproveRights || post.author?.id === currentUserId) ? (
                                                        <>
                                                            <option value="published">Published</option>
                                                            <option value="pending">Pending</option>
                                                            <option value="draft">Draft</option>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <option value="pending">Request Approval</option>
                                                            <option value="draft">Draft</option>
                                                        </>
                                                    )}
                                                </select>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950"
                                                    onClick={() => handleSaveStatus(post.id)}
                                                    disabled={isPostProcessing(post.id)}
                                                >
                                                    {savingPostIds.has(post.id) ? 'Saving...' : <FaSave />}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                                                    onClick={() => {
                                                        setEditingPostId(null);
                                                        setEditedStatus('');
                                                    }}
                                                    disabled={isPostProcessing(post.id)}
                                                >
                                                    <FaTimes />
                                                </Button>
                                            </>
                                        )}
                                    </>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <Badge 
                                            variant={post.status === 'published' ? 'default' : post.status === 'pending' ? 'secondary' : 'outline'}
                                            className={`${
                                                post.status === 'published'
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 hover:bg-green-200'
                                                    : post.status === 'pending'
                                                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 hover:bg-yellow-200'
                                                        : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200 hover:bg-slate-200'
                                            }`}
                                        >
                                            {post.status === 'pending' && !hasApproveRights
                                                ? 'Waiting for Approval'
                                                : post.status}
                                        </Badge>
                                        {(hasApproveRights || post.author?.id === currentUserId) && (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950"
                                                onClick={() => {
                                                    setEditingPostId(post.id);
                                                    setEditedStatus(post.status);
                                                }}
                                                disabled={isPostProcessing(post.id)}
                                            >
                                                <FaEdit />
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>

                            {hasPermissionForPost(post) && (
                                <div className="flex items-center gap-1.5">
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950"
                                        onClick={() => onSelectPost(post.id)}
                                        disabled={isPostProcessing(post.id)}
                                        title="Edit Post"
                                    >
                                        <FaEdit />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                                        onClick={() => handleDeletePost(post.id)}
                                        disabled={isPostProcessing(post.id)}
                                        title="Delete Post"
                                    >
                                        {deletingPostIds.has(post.id) ? (
                                            <span className="text-xs">Deleting...</span>
                                        ) : (
                                            <FaTrash />
                                        )}
                                    </Button>
                                    {canManagePermissions && (
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950"
                                            onClick={() => setSelectedPostForPermissions(post)}
                                            disabled={isPostProcessing(post.id)}
                                            title="Manage Permissions"
                                        >
                                            <FaUserLock />
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>
                    </li>
                ))}
            </ul>
            {!showAll && (
                <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <Button
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        variant="outline"
                        className="w-full sm:w-auto"
                    >
                        ← Previous
                    </Button>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
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
