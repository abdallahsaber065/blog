// pages/admin/posts/edit.tsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import PostEditor from '@/components/Admin/PostEditor';
import Tag from '@prisma/client';
import withAuth from '@/components/Admin/withAuth';
import readingTime from "reading-time"
import { slug } from 'github-slugger';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Loader2, AlertTriangle, ArrowLeft } from 'lucide-react';

interface Post {
    id: number;
    title: string;
    featured_image_url: string;
    content: string;
    tags: Tag[];
    category: Category;
    permissions?: PostPermission[];
    author: Author;
    status: string;
}

interface PostPermission {
    user_id: number | null;
    role: string | null;
}

interface Tag {
    id: number;
    name: string;
}

interface Category {
    id: number;
    name: string;
}

interface Author {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
}

const ApproveRoles = ['admin', 'moderator'];

const getStatusByRole = (role: string, status: string) => {
    if (status === 'draft') {
        return 'draft';
    } else
        if (ApproveRoles.includes(role)) {
            return status;
        } else {
            return 'pending';
        }
};

const PostEditorPage: React.FC = () => {
    const [post, setPost] = useState<Post | null>(null);
    const [tags, setTags] = useState<Tag[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingPost, setLoadingPost] = useState(false);
    const [postLoaded, setPostLoaded] = useState(false);
    const [author, setAuthor] = useState<Author | null>(null);
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const { data: session } = useSession();
    const [postNotFound, setPostNotFound] = useState(false);
    const [isValidId, setIsValidId] = useState<boolean | null>(null);

    const router = useRouter();
    const { id } = router.query;

    useEffect(() => {
        if (!id) {
            setIsValidId(false);
            return;
        }

        const numId = Number(id);
        if (isNaN(numId)) {
            setIsValidId(false);
            return;
        }

        setIsValidId(true);

        if (session?.user) {
            checkPermission(numId).then(hasPermission => {
                if (hasPermission) {
                    loadData(numId);
                }
            });
        }
    }, [id, session]);

    const checkPermission = async (postId: number) => {
        const userId = Number(session?.user?.id);
        const userRole = session?.user?.role;

        try {
            if (ApproveRoles.includes(userRole || '')) {
                setHasPermission(true);
                return true;
            }

            const postWhere = JSON.stringify({ id: postId });
            const postSelect = JSON.stringify({
                author: { select: { id: true } },
                permissions: { select: { user_id: true, role: true } }
            });

            const postUrl = `/api/posts?where=${postWhere}&select=${postSelect}`;
            const postData = await fetch(postUrl).then(res => res.json());
            const post = postData[0];

            if (!post) {
                setPostNotFound(true);
                setHasPermission(false);
                return false;
            }

            if (post.author?.id === userId) {
                setHasPermission(true);
                return true;
            }

            const hasPermission = post.permissions?.some((p: { user_id: number; role: string | undefined; }) =>
                (p.user_id === userId) || (p.role === userRole)
            );

            setHasPermission(hasPermission);
            return hasPermission;

        } catch (error) {
            console.error('Permission check error:', error);
            setHasPermission(false);
            return false;
        }
    };

    const loadData = async (postId: number) => {
        if (postLoaded) return;
        setLoadingPost(true);
        try {
            const postWhere = JSON.stringify({ id: postId });
            const postSelect = JSON.stringify({
                id: true,
                title: true,
                excerpt: true,
                featured_image_url: true,
                content: true,
                status: true,
                author: {
                    select: {
                        id: true,
                        username: true,
                        first_name: true,
                        last_name: true,
                    },
                },
                permissions: {
                    select: {
                        user_id: true,
                        role: true,
                    }
                },
                tags: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                category: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            });

            const postUrl = `/api/posts?where=${postWhere}&select=${postSelect}`;
            let [postData, tagsData, categoriesData] = await Promise.all([
                fetch(postUrl).then((res) => res.json()),
                fetch(`/api/tags`).then((res) => res.json()),
                fetch(`/api/categories`).then((res) => res.json()),
            ]);

            const post = postData[0];
            if (!post) {
                setPostNotFound(true);
                return;
            }

            setAuthor(post.author);

            const boldMatch = post.content.match(/\\\*\\\*[^*]+?\\\*\\\*/g);
            const boldTextOnly = boldMatch?.map((text: string) => text.replace(/\\\*\\\*/g, ''));
            const boldTextTrimmed = boldTextOnly?.map((text: string) => text.trim());

            boldMatch?.forEach((text: string, index: number) => {
                post.content = post.content.replace(text, ` **${boldTextTrimmed[index]}** `);
            });

            setPost(post);
            setTags(tagsData);
            setCategories(categoriesData);
            setPostLoaded(true);
            setLoading(false);
        } catch (error) {
            console.error('Error loading post:', error);
            toast.error('Failed to load post');
        } finally {
            setLoadingPost(false);
        }
    };

    const handleSave = async (updatedPostRecieved: any, status: string) => {
        if (!ApproveRoles.includes(session?.user?.role || '') &&
            author?.id !== Number(session?.user?.id)) {
            toast.dismiss();
            toast.error('You do not have permission to edit this post');
            return;
        }

        setLoading(true);
        const resolvedStatus = getStatusByRole(session?.user?.role || 'reader', status);

        let updatedPost = { ...updatedPostRecieved, status: resolvedStatus };
        try {
            updatedPost.tags = {
                set: [],
                connectOrCreate: updatedPost.tags.map((tag: Tag) => {
                    if (tag.id > 0) {
                        return {
                            where: { id: tag.id },
                            create: { name: tag.name, slug: slug(tag.name) }
                        };
                    } else {
                        return {
                            where: { slug: slug(tag.name) },
                            create: { name: tag.name, slug: slug(tag.name) }
                        };
                    }
                })
            };

            updatedPost.category = {
                connectOrCreate: {
                    where: { slug: slug(updatedPost.category.name) },
                    create: {
                        name: updatedPost.category.name,
                        slug: slug(updatedPost.category.name)
                    }
                }
            };

            let finalPost = { ...updatedPost };
            delete finalPost.id;
            finalPost.reading_time = Math.round(readingTime(finalPost.content).minutes);
            finalPost.slug = slug(finalPost.title);

            const response = await fetch(`/api/posts`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data: finalPost, id: updatedPost.id }),
            });

            if (response.ok) {
                toast.dismiss();
                if (resolvedStatus === 'published') {
                    toast.success('Post published successfully');
                } else if (resolvedStatus === 'pending') {
                    toast.success('Post submitted for review');
                } else {
                    toast.success('Draft saved successfully');
                }
            } else {
                const errorData = await response.json();
                toast.dismiss();
                toast.error(`Failed to update post: ${errorData.error}`);
            }
        } catch (error) {
            console.error('Save error:', error);
            toast.dismiss();
            toast.error('Failed to update post');
        } finally {
            setLoading(false);
        }
    };

    const renderErrorMessage = () => {
        if (!isValidId) {
            return (
                <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6">
                        <AlertTriangle className="w-7 h-7 text-red-400" />
                    </div>
                    <h2 className="text-xl font-display font-bold text-foreground mb-2">Invalid Post ID</h2>
                    <p className="text-sm text-muted-foreground mb-6">The post ID provided is invalid or missing.</p>
                    <button
                        onClick={() => router.push('/admin/posts')}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gold/10 border border-gold/30 text-gold text-sm font-medium hover:bg-gold/20 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Return to Posts
                    </button>
                </div>
            );
        }

        if (postNotFound && hasPermission) {
            return (
                <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center mb-6">
                        <AlertTriangle className="w-7 h-7 text-gold" />
                    </div>
                    <h2 className="text-xl font-display font-bold text-foreground mb-2">Post Not Found</h2>
                    <p className="text-sm text-muted-foreground mb-6">The post you&apos;re looking for doesn&apos;t exist or has been deleted.</p>
                    <button
                        onClick={() => router.push('/admin/posts')}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gold/10 border border-gold/30 text-gold text-sm font-medium hover:bg-gold/20 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Return to Posts
                    </button>
                </div>
            );
        }

        if (hasPermission === false) {
            return (
                <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6">
                        <AlertTriangle className="w-7 h-7 text-red-400" />
                    </div>
                    <h2 className="text-xl font-display font-bold text-foreground mb-2">Access Denied</h2>
                    <p className="text-sm text-muted-foreground mb-6 max-w-md">You do not have permission to edit this post. Only the author or users with proper permissions can edit this content.</p>
                    <button
                        onClick={() => router.push('/admin/posts')}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gold/10 border border-gold/30 text-gold text-sm font-medium hover:bg-gold/20 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Return to Posts
                    </button>
                </div>
            );
        }

        return null;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="container mx-auto p-4 text-foreground"
            id="post-editor-container"
        >

            {loadingPost && (
                <div className="flex flex-col items-center justify-center py-24 gap-4" id="post-editor-loading">
                    <Loader2 className="w-8 h-8 animate-spin text-gold" />
                    <span className="text-muted-foreground font-medium">Loading post…</span>
                </div>
            )}

            {!loadingPost && renderErrorMessage()}

            {!loadingPost && hasPermission && post && !postNotFound && (
                <div id="post-editor-form">
                    <PostEditor
                        post={post}
                        tags={tags}
                        categories={categories}
                        onSave={handleSave}
                        isLoading={loading}
                    />
                </div>
            )}
        </motion.div>
    );
};

export default withAuth(PostEditorPage, ['admin', "moderator", "editor"]);