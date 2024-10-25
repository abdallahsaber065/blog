// pages/admin/index.tsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { ClipLoader } from 'react-spinners';
import PostList from '@/components/Admin/PostList';
import { useSession } from 'next-auth/react';
import withAdminAuth from '@/components/withAdminAuth';

interface Post {
    id: number;
    slug: string;
    tags: string[];
    title: string;
    category: { id: number; name: string };
    author: { id: number; first_name: string; last_name: string };
    created_at: string;
}

const DashboardPage: React.FC = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { data: session, status } = useSession();

    useEffect(() => {
        if (status === 'authenticated' && session?.user?.role !== 'admin') {
            router.push('/');
        }
    }, [status, session]);

    useEffect(() => {
        loadPosts();
    }, []);

    const loadPosts = async () => {
        setLoading(true);
        const selectString = JSON.stringify({
            id: true,
            slug: true,
            title: true,
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
        });

        const postsData = await fetch('/api/posts?select=' + selectString).then((res) => res.json());
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
                toast.success('Post deleted successfully');
                loadPosts();
            } else {
                toast.error('Failed to delete post');
            }
        } catch (error) {
            toast.error('Failed to delete post');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (id: number) => {
        router.push(`/admin/edit-post?id=${id}`);
    };

    const handleCreate = () => {
        router.push('/admin/create-post');
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
            <div className="mb-4">
                <button
                    className="bg-blue-500 text-white p-2 rounded"
                    onClick={handleCreate}
                >
                    Create New Post
                </button>
            </div>
            {loading && <ClipLoader />}
            <PostList posts={posts} onSelectPost={handleEdit} onDeletePost={handleDelete} />
        </div>
    );
};

export default withAdminAuth(DashboardPage);