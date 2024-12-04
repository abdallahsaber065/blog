// pages/admin/posts/edit.tsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { ClipLoader } from 'react-spinners';
import PostEditor from '@/components/Admin/PostEditor';
import Tag from '@prisma/client';
import withAuth from '@/components/Admin/withAuth';
import readingTime from "reading-time"
import { slug } from 'github-slugger';
import { useSession } from 'next-auth/react';
import EditTourGuide from '@/components/Admin/EditTourGuide';

interface Post {
    id: number;
    title: string;
    featured_image_url: string;
    content: string;
    tags: Tag[];
    category: Category;
    permissions?: PostPermission[];
    author: Author;
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
    const [showTour, setShowTour] = useState(false);
    const [postNotFound, setPostNotFound] = useState(false);
    const [isValidId, setIsValidId] = useState<boolean | null>(null);

    const router = useRouter();
    const { id } = router.query;

    useEffect(() => {
        // Check if id exists and is valid
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

        // Only proceed with permission check if we have a valid ID and session
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
            // First, check if user is admin/moderator
            if (ApproveRoles.includes(userRole || '')) {
                setHasPermission(true);
                return true;
            }

            // Fetch post with permissions
            const postWhere = JSON.stringify({ id: postId });
            const postSelect = JSON.stringify({
                author: {
                    select: { id: true }
                },
                permissions: {
                    select: {
                        user_id: true,
                        role: true
                    }
                }
            });
            
            const postUrl = `/api/posts?where=${postWhere}&select=${postSelect}`;
            const postData = await fetch(postUrl).then(res => res.json());
            const post = postData[0];

            if (!post) {
                setPostNotFound(true);
                setHasPermission(false);
                return false;
            }

            // Check if user is author
            if (post.author?.id === userId) {
                setHasPermission(true);
                return true;
            }

            // Check permissions
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
            // Fetch post with all necessary data including permissions
            const postWhere = JSON.stringify({ id: postId });
            const postSelect = JSON.stringify({
                id: true,
                title: true,
                featured_image_url: true,
                content: true,
                author: {
                    select: {
                        id: true,
                        username: true,
                        first_name: true,
                        last_name: true,
                    },
                },
                permissions: {  // Add permissions to the select
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

            // Set author
            setAuthor(post.author);

            // Process content (your existing bold text processing)
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
        // Add permission check
        if (!ApproveRoles.includes(session?.user?.role || '') && 
            author?.id !== Number(session?.user?.id)) {
            toast.dismiss();
            toast.error('You do not have permission to edit this post');
            return;
        }

        setLoading(true);
        // Get the status based on the user role
        status = getStatusByRole(session?.user?.role || 'reader', status);

        let updatedPost = { ...updatedPostRecieved, status };
        try {
            // Format tags - handle both existing and new tags
            updatedPost.tags = {
                set: [], // Clear existing connections
                connectOrCreate: updatedPost.tags.map((tag: Tag) => {
                    if (tag.id > 0) {
                        // Existing tag
                        return {
                            where: { id: tag.id },
                            create: { // Required even for existing tags
                                name: tag.name,
                                slug: slug(tag.name)
                            }
                        };
                    } else {
                        // New tag
                        return {
                            where: { slug: slug(tag.name) },
                            create: {
                                name: tag.name,
                                slug: slug(tag.name)
                            }
                        };
                    }
                })
            };
    
            // Format category
            updatedPost.category = {
                connectOrCreate: {
                    where: {
                        slug: slug(updatedPost.category.name)
                    },
                    create: {
                        name: updatedPost.category.name,
                        slug: slug(updatedPost.category.name)
                    }
                }
            };
    
            let finalPost = { ...updatedPost };
            delete finalPost.id;
            finalPost.reading_time = Math.round(readingTime(finalPost.content).minutes);
            // add slug to finalPost
            finalPost.slug = slug(finalPost.title);

    
            const response = await fetch(`/api/posts`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    data: finalPost,
                    id: updatedPost.id
                }),
            });
    
            if (response.ok) {
                toast.dismiss();
                if (status === 'published') {
                    toast.success('Post updated successfully');
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

    // Helper function to render error message
    const renderErrorMessage = () => {
        if (!isValidId) {
            return (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
                    <div className="flex">
                        <div className="py-1">
                            <svg className="w-6 h-6 mr-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <div>
                            <p className="font-bold">Invalid Post ID</p>
                            <p>The post ID provided is invalid or missing.</p>
                            <button 
                                onClick={() => router.push('/admin/posts')}
                                className="mt-2 text-red-600 hover:text-red-800 underline"
                            >
                                Return to Posts List
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        if (postNotFound && hasPermission) {
            return (
                <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4" role="alert">
                    <div className="flex">
                        <div className="py-1">
                            <svg className="w-6 h-6 mr-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <div>
                            <p className="font-bold">Post Not Found</p>
                            <p>The post you're looking for doesn't exist or has been deleted.</p>
                            <button 
                                onClick={() => router.push('/admin/posts')}
                                className="mt-2 text-yellow-600 hover:text-yellow-800 underline"
                            >
                                Return to Posts List
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        if (hasPermission === false) {
            return (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
                    <div className="flex">
                        <div className="py-1">
                            <svg className="w-6 h-6 mr-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <div>
                            <p className="font-bold">Access Denied</p>
                            <p>You do not have permission to edit this post. Only the author or users with proper permissions can edit this content.</p>
                            <button 
                                onClick={() => router.push('/admin/posts')}
                                className="mt-2 text-red-600 hover:text-red-800 underline"
                            >
                                Return to Posts List
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return null;
    };

    return (
        <div className="container mx-auto p-4 text-slate-900 dark:text-slate-300" id="post-editor-container">
            <EditTourGuide 
                run={showTour} 
                onFinish={() => setShowTour(false)}
            />
            
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold mb-4" id="post-editor-title">Edit Post</h1>
                <button
                    className="flex items-center gap-2 text-blue-500 hover:text-blue-600 transition-colors duration-200"
                    onClick={() => setShowTour(true)}
                >
                    <span className="text-lg">❔</span>
                    Show Guide
                </button>
            </div>
            
            {loadingPost && (
                <div className="flex items-center justify-center p-4" id="post-editor-loading">
                    <ClipLoader />
                    <span className="ml-2">Loading post...</span>
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
        </div>
    );
};

export default withAuth(PostEditorPage, ['admin', "moderator", "editor"]);