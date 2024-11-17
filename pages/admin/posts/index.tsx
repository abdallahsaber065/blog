// pages/admin/index.tsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { ClipLoader } from 'react-spinners';
import PostList from '@/components/Admin/PostList';
import withAuth from '@/components/Admin/withAuth';

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


const DashboardPage: React.FC = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        loadPosts();
    }, []);

    const loadPosts = async () => {
        setLoading(true);
        const blogPostSelectFields = JSON.stringify({
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
        });

        const postsData = await fetch('/api/posts?select=' + blogPostSelectFields).then((res) => res.json());
        setPosts(postsData);
        setLoading(false);
    };

    const handleDelete = async (id: number) => {
        setLoading(true);
        try {
            const response = await fetch(`/api/posts?id=${id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                toast.dismiss();
                toast.success('Post deleted successfully');
                loadPosts();
            } else {
                toast.dismiss();
                toast.error('Failed to delete post');
            }
        } catch (error) {
            toast.dismiss();
            toast.error('Failed to delete post');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (id: number) => {
        router.push(`/admin/posts/edit?id=${id}`);
    };

    const handleCreate = () => {
        router.push('/admin/posts/create');
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4 text-slate-800 dark:text-slate-400">Dashboard</h1>
            <div className="mb-4">
                <button
                    className="bg-blue-500 text-white p-2 rounded"
                    onClick={handleCreate}
                >
                    Create New Post
                </button>
            </div>
            {loading && <ClipLoader />}
            <PostList posts={posts} onSelectPost={handleEdit} onDeletePost={handleDelete} setPosts={setPosts} />
        </div>
    );
};

export default withAuth(DashboardPage, ['admin', "moderator", "editor"]);