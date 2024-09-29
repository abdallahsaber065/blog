// pages/admin/PostEditorPage.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { toast, ToastContainer } from 'react-toastify';
import { ClipLoader } from 'react-spinners';
import PostEditor from '@/components/admin/PostEditor';
import 'react-toastify/dist/ReactToastify.css';

interface Post {
    id: number;
    title: string;

    featured_image_url: string;
    content: string;
    tags: number[];
    categories: number[];
}

interface Tag {
    id: number;
    name: string;
}

interface Category {
    id: number;
    name: string;
}

const PostEditorPage: React.FC = () => {
    const [post, setPost] = useState<Post | null>(null);
    const [tags, setTags] = useState<Tag[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { id } = router.query;

    useEffect(() => {
        if (id) {
            loadData(Number(id));
        }
    }, [id]);

    const loadData = async (postId: number) => {
        setLoading(true);
        const [postData, tagsData, categoriesData] = await Promise.all([
            fetch(`/api/posts?where={"id":${postId}}`).then((res) => res.json()),
            fetch(`/api/tags`).then((res) => res.json()),
            fetch(`/api/categories`).then((res) => res.json()),
        ]);

        const post = postData[0];
        if (!post) {
            toast.error('Post not found');
            router.push('/admin/posts');
            return;
        }


        
        

        setPost(post);
        setTags(tagsData);
        setCategories(categoriesData);
        setLoading(false);
    };

    const handlePostChange = (field: keyof Post, value: any) => {
        if (post) {
            setPost({ ...post, [field]: value });
        }
    };

    const handleSave = async () => {
        if (!post) return;
        setLoading(true);
        try {
            const response = await fetch(`/api/posts`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(post),
            });
            if (response.ok) {
                toast.success('Post updated successfully');
                router.push('/admin/posts');
            } else {
                toast.error('Failed to update post');
            }
        } catch (error) {
            toast.error('Failed to update post');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <ToastContainer />
            <h1 className="text-2xl font-bold mb-4">Edit Post</h1>
            {loading && <ClipLoader />}
            {post && (
                <PostEditor
                    post={post}
                    tags={tags}
                    categories={categories}
                    onChange={handlePostChange}
                    onSave={handleSave}
                />
            )}
        </div>
    );
};

export default PostEditorPage;