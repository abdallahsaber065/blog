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

interface Post {
    id: number;
    title: string;
    featured_image_url: string;
    content: string;
    tags: Tag[];
    category: Category;
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
    const [author, setAuthor] = useState<Author | null>(null);
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const { data: session } = useSession();

    const router = useRouter();
    const { id } = router.query;

    useEffect(() => {
        if (id) {
            loadData(Number(id));
        }
    }, [id]);

    const loadData = async (postId: number) => {
        setLoadingPost(true);
        try {
            // First, fetch just the post's author to check permissions
            const authorCheckWhere = JSON.stringify({ id: postId });
            const authorCheckSelect = JSON.stringify({
                author: {
                    select: {
                        id: true,
                    }
                }
            });
            
            const authorCheckUrl = `/api/posts?where=${authorCheckWhere}&select=${authorCheckSelect}`;
            const authorCheckResponse = await fetch(authorCheckUrl).then(res => res.json());
            
            // Check permissions
            const isAuthor = authorCheckResponse[0]?.author?.id === Number(session?.user?.id);
            const hasApproveRole = ApproveRoles.includes(session?.user?.role || '');
            
            setHasPermission(isAuthor || hasApproveRole);
            
            if (!isAuthor && !hasApproveRole) {
                return; // Don't load the rest of the data
            }

            // Continue with existing loadData logic if authorized
            const postWhere = JSON.stringify({
                id: postId,
            });

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
            console.log("Post Data: ", postData);

            // Set author without removing it from postData
            setAuthor(postData[0].author);
            let post = postData[0];

            if (!post) {
                toast.error('Post not found');
                return;
            }

            // add space after and before **...** to prevent markdown from rendering bold text
            // retrieve the bold text from the content before editing ex.: \*\*I often do this thing where list items have headings.\*\*
            const boldMatch = post.content.match(/\\\*\\\*[^*]+?\\\*\\\*/g);
            const boldTextOnly = boldMatch?.map((text: string) => text.replace(/\\\*\\\*/g, ''));
            // trim the bold text from right and left
            const boldTextTrimmed = boldTextOnly?.map((text: string) => text.trim());

            // replace matched bold text with trimmed bold text
            boldMatch?.forEach((text: string, index: number) => {
                post.content = post.content.replace(text, ` **${boldTextTrimmed[index]}** `);
            });
            console.log("Post: ", post.content);
            console.log("Bold Match: ", boldMatch);
            console.log("Bold Text Only: ", boldTextOnly);
            console.log("Bold Text Trimmed: ", boldTextTrimmed);

            setPost(post);
            setTags(tagsData);
            setCategories(categoriesData);
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
                if (status === 'published') {
                    toast.success('Post updated successfully');
                } else {
                    toast.success('Draft saved successfully');
                }
            } else {
                const errorData = await response.json();
                toast.error(`Failed to update post: ${errorData.error}`);
            }
        } catch (error) {
            console.error('Save error:', error);
            toast.error('Failed to update post');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Edit Post</h1>
            
            {loadingPost && (
                <div className="flex items-center justify-center p-4">
                    <ClipLoader />
                    <span className="ml-2">Loading post...</span>
                </div>
            )}

            {!loadingPost && hasPermission === false && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
                    <div className="flex">
                        <div className="py-1">
                            <svg className="w-6 h-6 mr-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <div>
                            <p className="font-bold">Access Denied</p>
                            <p>You do not have permission to edit this post. Only the author or administrators can edit this content.</p>
                            <button 
                                onClick={() => router.push('/admin/posts')}
                                className="mt-2 text-red-600 hover:text-red-800 underline"
                            >
                                Return to Posts List
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {!loadingPost && hasPermission && post && (
                <PostEditor
                    post={post}
                    tags={tags}
                    categories={categories}
                    onSave={handleSave}
                />
            )}
        </div>
    );
};

export default withAuth(PostEditorPage, ['admin', "moderator", "editor"]);