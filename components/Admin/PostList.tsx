import { useSession } from 'next-auth/react';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { FaTrash, FaEdit, FaSave, FaTimes } from 'react-icons/fa';

interface Post {
    id: number;
    slug: string;
    tags: string[];
    title: string;
    category: { id: number; name: string };
    author: { id: number; username: string; first_name: string; last_name: string };
    created_at: string;
    status: string;
}

interface PostListProps {
    posts: Post[];
    onSelectPost: (id: number) => void;
    onDeletePost: (id: number) => void;
    setPosts: React.Dispatch<React.SetStateAction<Post[]>>;
}

const ApproveRoles = ['admin', 'moderator'];

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
    const { data: session, status } = useSession();

    const deleteRoles = ['admin'];

    const hasApproveRights = session?.user?.role && ApproveRoles.includes(session.user.role);
    const currentUserId = Number(session?.user?.id);

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
                toast.error('You do not have permission to publish posts');
                return;
            }

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
                toast.success('Status updated successfully');
                setEditingPostId(null);
                setEditedStatus('');
                // Update the posts state directly
                const updatedPosts = posts.map(post => 
                    post.id === postId ? { ...post, status: editedStatus } : post
                );
                setPosts(updatedPosts);
            } else {
                toast.error('Failed to update status');
            }
        } catch (error) {
            toast.error('Failed to update status');
        }
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
                                                    className="text-green-500 hover:text-green-600 ml-2"
                                                    onClick={() => handleSaveStatus(post.id)}
                                                >
                                                    <FaSave />
                                                </button>
                                                <button
                                                    className="text-red-500 hover:text-red-600 ml-2"
                                                    onClick={() => {
                                                        setEditingPostId(null);
                                                        setEditedStatus('');
                                                    }}
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
                                                className="text-blue-500 hover:text-blue-600"
                                                onClick={() => {
                                                    setEditingPostId(post.id);
                                                    setEditedStatus(post.status);
                                                }}
                                            >
                                                <FaEdit />
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                            
                            {(hasApproveRights || post.author.id === currentUserId) && (
                                <div className="flex items-center space-x-2">
                                    <button
                                        className="text-green-500 hover:text-green-600"
                                        onClick={() => onSelectPost(post.id)}
                                    >
                                        <FaEdit />
                                    </button>
                                    <button
                                        className="text-red-500 hover:text-red-600"
                                        onClick={() => {
                                            if ((session?.user?.role && deleteRoles.includes(session.user.role)) || Number(session?.user?.id) === post.author.id) {
                                                onDeletePost(post.id);
                                            } else {
                                                toast.error('You do not have permission to delete this post.');
                                            }
                                        }}
                                    >
                                        <FaTrash />
                                    </button>
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
        </div>
    );
};

export default PostList;
