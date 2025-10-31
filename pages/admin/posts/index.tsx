// pages/admin/index.tsx
import PostList from '@/components/Admin/PostList';
import withAuth from '@/components/Admin/withAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { ClipLoader } from 'react-spinners';

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
        <div className="container mx-auto p-4 md:p-6 lg:p-8">
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <CardTitle className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-200">
                            Posts Dashboard
                        </CardTitle>
                        <Button
                            onClick={handleCreate}
                            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 shadow-md transition-all"
                            size="lg"
                        >
                            <Plus className="mr-2 h-5 w-5" />
                            Create New Post
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <ClipLoader color="#3b82f6" size={50} />
                        </div>
                    ) : (
                        <PostList posts={posts} onSelectPost={handleEdit} onDeletePost={handleDelete} setPosts={setPosts} />
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default withAuth(DashboardPage, ['admin', "moderator", "editor"]);