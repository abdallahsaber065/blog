// components/PostList.tsx
import { useSession } from 'next-auth/react';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { FaTrash, FaEdit } from 'react-icons/fa';

interface Post {
    id: number;
    slug: string
    tags: string[];
    title: string;
    category: { id: number; name: string };
    author: { id: number; first_name: string; last_name: string };
    created_at: string;
}

interface PostListProps {
    posts: Post[];
    onSelectPost: (id: number) => void;
    onDeletePost: (id: number) => void;
}

const PostList: React.FC<PostListProps> = ({ posts, onSelectPost, onDeletePost }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const [postsPerPage, setPostsPerPage] = useState(10);
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [showAll, setShowAll] = useState(false);
    const [advancedSearch, setAdvancedSearch] = useState(false);
    const [authorFilter, setAuthorFilter] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const { data: session, status } = useSession();

    const deleteRoles = ['admin'];

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

    return (
        <div className="p-4 bg-white dark:bg-dark rounded shadow-md">
            <div className="mb-4 flex justify-between items-center">
                <input
                    type="text"
                    placeholder="Search posts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-light dark:bg-gray text-dark dark:text-light"
                />
                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-light dark:bg-gray text-dark dark:text-light"
                >
                    <option value="All">All Categories</option>
                    {Array.from(new Set(posts.map(post => post.category.name))).map(category => (
                        <option key={category} value={category}>{category}</option>
                    ))}
                </select>
                <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="p-2 bg-blue-500  text-white rounded"
                >
                    Sort {sortOrder === 'asc' ? 'Descending' : 'Ascending'}
                </button>
                <button
                    onClick={() => setShowAll(!showAll)}
                    className="p-2 bg-green-500 text-white rounded"
                >
                    {showAll ? 'Show Paginated' : 'Show All'}
                </button>
                <select
                    value={postsPerPage}
                    onChange={(e) => setPostsPerPage(Number(e.target.value))}
                    className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-light dark:bg-gray text-dark dark:text-light"
                >
                    {[5, 10, 20, 50].map(number => (
                        <option key={number} value={number}>{number} per page</option>
                    ))}
                </select>
                <button
                    onClick={() => setAdvancedSearch(!advancedSearch)}
                    className="p-2 bg-yellow-500  text-white rounded"
                >
                    {advancedSearch ? 'Hide Advanced Search' : 'Show Advanced Search'}
                </button>
            </div>
            {advancedSearch && (
                <div className="mb-4 p-4 border border-gray-300 dark:border-gray-600 rounded bg-light dark:bg-gray">
                    <input
                        type="text"
                        placeholder="Filter by author..."
                        value={authorFilter}
                        onChange={(e) => setAuthorFilter(e.target.value)}
                        className="p-2 border border-gray-300 dark:border-gray-600 rounded mb-2 bg-light dark:bg-gray text-dark dark:text-light"
                    />
                    <input
                        type="date"
                        placeholder="Filter by date..."
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-light dark:bg-gray text-dark dark:text-light"
                    />
                </div>
            )}
            <ul className="mb-4">
                {paginatedPosts.map((post) => (
                    <li key={post.id} className="mb-2 flex justify-between items-center">
                        <a className="text-blue-500 cursor-pointer" href={`/blogs/${post.slug}`} target="_blank">
                            {post.title}
                        </a>
                        <div>
                            <button
                                className="text-green-500 mr-2"
                                onClick={() => onSelectPost(post.id)}
                            >
                                <FaEdit />
                            </button>

                            <button
                                className="text-red-500"
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
                    </li>
                ))}
            </ul>
            {!showAll && (
                <div className="flex justify-between items-center">
                    <button
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2 bg-gray-300 dark:bg-gray-600 rounded disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <span className="text-dark dark:text-light">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-2 bg-gray-300 dark:bg-gray-600 rounded disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default PostList;