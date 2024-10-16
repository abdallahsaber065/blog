// pages/admin/PostEditorPage.tsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { toast, ToastContainer } from 'react-toastify';
import { ClipLoader } from 'react-spinners';
import PostEditor from '@/components/admin/PostEditor';
import 'react-toastify/dist/ReactToastify.css';
import Tag from '@prisma/client';
import withAdminAuth from '@/components/withAdminAuth';
import readingTime from "reading-time"

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
        const postWhere = JSON.stringify({
            id: postId,
        });

        const postSelect = JSON.stringify({
            id: true,
            title: true,
            featured_image_url: true,
            content: true,
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
        const [postData, tagsData, categoriesData] = await Promise.all([
            fetch(postUrl).then((res) => res.json()),
            fetch(`/api/tags`).then((res) => res.json()),
            fetch(`/api/categories`).then((res) => res.json()),
        ]);

        let post = postData[0];
        if (!post) {
            toast.error('Post not found');
            return;
        }


        // add space after adn before **...** to prevent markdown from rendering bold text
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
    };

    const handleSave = async (updatedPost: any) => {
        setLoading(true);
        try {
            console.log(updatedPost.tags);
            // serialize tags to match the API schema
            updatedPost.tags = updatedPost.tags.map((tag: Tag) => (
                {
                    id: tag.id
                }));
            
            // serialize category to match the API schema
            updatedPost.category = {
                id: updatedPost.category.id
            };
            
            // remove id from updatedPost
            let finalPost = { ...updatedPost };
            delete finalPost.id;

            // calculate reading time
            finalPost.reading_time = Math.round(readingTime(finalPost.content).minutes);

            const response = await fetch(`/api/posts`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(
                    {
                        data: finalPost,
                        id: updatedPost.id
                    }),
            });
            if (response.ok) {
                toast.success('Post updated successfully');
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
                    onSave={handleSave}
                />
            )}
        </div>
    );
};

export default withAdminAuth(PostEditorPage);