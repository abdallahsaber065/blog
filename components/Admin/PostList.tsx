import { useSession } from 'next-auth/react';
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FaTrash, FaEdit, FaSave, FaTimes, FaUserLock } from 'react-icons/fa';

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
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-slate-200 dark:bg-slate-700 rounded hover:bg-slate-300 dark:hover:bg-slate-600"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : 'Save'}
                    </button>
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
        const matchesCategory = categoryFilter === 'All' || post.category.name === categoryFilter;
        const matchesAuthor = !authorFilter || post.author.first_name.toLowerCase().includes(authorFilter.toLowerCase()) || post.author.last_name.toLowerCase().includes(authorFilter.toLowerCase());
        const matchesDate = !dateFilter || post.created_at.includes(dateFilter);
        return matchesSearchTerm && matchesCategory && matchesAuthor && matchesDate;
    });

    const sortedPosts = filteredPosts.sort((a, b) => {
        if (!hasApproveRights) {
            if (a.author.id === currentUserId && b.author.id !== currentUserId) return -1;
            if (a.author.id !== currentUserId && b.author.id === currentUserId) return 1;
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
        if (post.author.id === currentUserId) {
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
        <div className="p-4 bg-white dark:bg-dark rounded shadow-md">
            <div className="mb-4 flex flex-wrap justify-between items-center space-y-2 md:space-y-0">
                <input
                    type="text"
                    placeholder="Search posts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="p-2 border border-slate-300 dark:border-slate-600 rounded bg-light dark:bg-gray text-dark dark:text-light w-full md:w-auto"
                />
                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="p-2 border border-slate-300 dark:border-slate-600 rounded bg-light dark:bg-gray text-dark dark:text-light w-full md:w-auto"
                >
                    <option value="All">All Categories</option>
                    {Array.from(new Set(posts.map(post => post.category.name))).map(category => (
                        <option key={category} value={category}>{category}</option>
                    ))}
                </select>
                <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="p-2 bg-zinc-600 text-white rounded w-full md:w-auto dark:text-slate-300 font-bold"
                >
                    Sort {sortOrder === 'asc' ? 'Descending' : 'Ascending'}
                </button>
                <button
                    onClick={() => setShowAll(!showAll)}
                    className="p-2 bg-slate-600 text-white rounded w-full md:w-auto dark:text-slate-300 font-bold"
                >
                    {showAll ? 'Show Paginated' : 'Show All'}
                </button>
                <select
                    value={postsPerPage}
                    onChange={(e) => setPostsPerPage(Number(e.target.value))}
                    className="p-2 border border-slate-300 dark:border-slate-600 rounded bg-light dark:bg-gray text-dark dark:text-light w-full md:w-auto"
                >
                    {[5, 10, 20, 50].map(number => (
                        <option key={number} value={number}>{number} per page</option>
                    ))}
                </select>
                <button
                    onClick={() => setAdvancedSearch(!advancedSearch)}
                    className="p-2 bg-amber-600 text-white rounded w-full md:w-auto dark:text-slate-200 font-bold"
                >
                    {advancedSearch ? 'Hide Advanced Search' : 'Show Advanced Search'}
                </button>
            </div>
            {advancedSearch && (
                <div className="mb-4 p-4 border border-slate-300 dark:border-slate-600 rounded bg-light dark:bg-gray space-y-2">
                    <input
                        type="text"
                        placeholder="Filter by author..."
                        value={authorFilter}
                        onChange={(e) => setAuthorFilter(e.target.value)}
                        className="p-2 border border-slate-300 dark:border-slate-600 rounded bg-light dark:bg-gray text-dark dark:text-light w-full"
                    />
                    <input
                        type="date"
                        placeholder="Filter by date..."
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="p-2 border border-slate-300 dark:border-slate-600 rounded bg-light dark:bg-gray text-dark dark:text-light w-full"
                    />
                </div>
            )}
            <ul className="mb-4 space-y-2">
                {paginatedPosts.map((post) => (
                    <li key={post.id} className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-2 md:space-y-0 p-3 border border-slate-200 dark:border-slate-700 rounded">
                        <div className="flex flex-col w-full md:w-1/2">
                            <a className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-medium" 
                               href={`/blogs/${post.slug}`} 
                               target="_blank">
                                {post.title}
                            </a>
                            <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                by {post.author.first_name} {post.author.last_name} 
                                <span className="text-slate-400 dark:text-slate-500">
                                    (@{post.author.username})
                                </span>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-4 w-full md:w-auto">
                            <div className="text-sm text-slate-600 dark:text-slate-400">
                                {editingPostId === post.id ? (
                                    <>
                                        {(hasApproveRights || post.author.id === currentUserId) && (
                                            <>
                                                <select
                                                    value={editedStatus}
                                                    onChange={(e) => setEditedStatus(e.target.value)}
                                                    className="p-2 border border-slate-300 dark:border-slate-600 rounded bg-light dark:bg-gray text-dark dark:text-light"
                                                    disabled={isPostProcessing(post.id)}
                                                >
                                                    {hasApproveRights ? (
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
                                                <button
                                                    className="text-green-500 hover:text-green-600 ml-2 disabled:opacity-50"
                                                    onClick={() => handleSaveStatus(post.id)}
                                                    disabled={isPostProcessing(post.id)}
                                                >
                                                    {savingPostIds.has(post.id) ? 'Saving...' : <FaSave />}
                                                </button>
                                                <button
                                                    className="text-red-500 hover:text-red-600 ml-2 disabled:opacity-50"
                                                    onClick={() => {
                                                        setEditingPostId(null);
                                                        setEditedStatus('');
                                                    }}
                                                    disabled={isPostProcessing(post.id)}
                                                >
                                                    <FaTimes />
                                                </button>
                                            </>
                                        )}
                                    </>
                                ) : (
                                    <div className="flex items-center space-x-4">
                                        <span className={`px-2 py-1 rounded text-xs ${
                                            post.status === 'published' 
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                : post.status === 'pending'
                                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                                    : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200'
                                        }`}>
                                            {post.status === 'pending' && !hasApproveRights 
                                                ? 'Waiting for Approval' 
                                                : post.status}
                                        </span>
                                        {(hasApproveRights || post.author.id === currentUserId) && (
                                            <button
                                                className="text-blue-500 hover:text-blue-600 disabled:opacity-50"
                                                onClick={() => {
                                                    setEditingPostId(post.id);
                                                    setEditedStatus(post.status);
                                                }}
                                                disabled={isPostProcessing(post.id)}
                                            >
                                                <FaEdit />
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                            
                            {hasPermissionForPost(post) && (
                                <div className="flex items-center space-x-2">
                                    <button
                                        className="text-green-500 hover:text-green-600 disabled:opacity-50"
                                        onClick={() => onSelectPost(post.id)}
                                        disabled={isPostProcessing(post.id)}
                                    >
                                        <FaEdit />
                                    </button>
                                    <button
                                        className="text-red-500 hover:text-red-600 disabled:opacity-50"
                                        onClick={() => handleDeletePost(post.id)}
                                        disabled={isPostProcessing(post.id)}
                                    >
                                        {deletingPostIds.has(post.id) ? (
                                            <span className="text-sm">Deleting...</span>
                                        ) : (
                                            <FaTrash />
                                        )}
                                    </button>
                                    {canManagePermissions && (
                                        <button
                                            className="text-blue-500 hover:text-blue-600 disabled:opacity-50"
                                            onClick={() => setSelectedPostForPermissions(post)}
                                            disabled={isPostProcessing(post.id)}
                                        >
                                            <FaUserLock />
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </li>
                ))}
            </ul>
            {!showAll && (
                <div className="flex flex-wrap justify-between items-center space-y-2 md:space-y-0">
                    <button
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2 bg-slate-300 dark:bg-slate-600 rounded disabled:opacity-50 w-full md:w-auto"
                    >
                        Previous
                    </button>
                    <span className="text-dark dark:text-light w-full md:w-auto text-center">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-2 bg-slate-300 dark:bg-slate-600 rounded disabled:opacity-50 w-full md:w-auto"
                    >
                        Next
                    </button>
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
