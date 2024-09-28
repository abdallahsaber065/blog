// pages/admin/PostListPage.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { ClipLoader } from 'react-spinners';
import { useRouter } from 'next/router';
import PostList from '@/components/admin/PostList';
import 'react-toastify/dist/ReactToastify.css';

interface Post {
    id: number;
    title: string;
}

const PostListPage: React.FC = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        loadPosts();
    }, []);

    const loadPosts = async () => {
        setLoading(true);
        const postsData = await fetch('/api/posts?select={"id":true,"title":true}').then((res) => res.json());
        setPosts(postsData);
        setLoading(false);
    };

    const handleDelete = async (id: number) => {
        setLoading(true);
        try {
            const response = await fetch(`/api/posts/${id}`, {
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
        router.push(`/admin/PostEditorPage?id=${id}`);
    };

    return (
        <div className="container mx-auto p-4">
            <ToastContainer />
            <h1 className="text-2xl font-bold mb-4">Posts</h1>
            {loading && <ClipLoader />}
            <PostList posts={posts} onSelectPost={handleEdit} onDeletePost={handleDelete} />
        </div>
    );
};

export default PostListPage;