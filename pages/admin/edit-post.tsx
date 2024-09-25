// pages/edit-post.tsx
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { FaSave, FaSpinner } from 'react-icons/fa';
import { ClipLoader } from 'react-spinners';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { PrismaClient } from '@prisma/client';
import { MDXEditor } from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';

const prisma = new PrismaClient();

const EditPost: React.FC<{ post: any, authors: any[], categories: any[], tags: any[] }> = ({ post, authors, categories, tags }) => {
    const router = useRouter();
    const [postData, setPostData] = useState(post);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isHtmlMode, setIsHtmlMode] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setPostData((prevPost: any) => (prevPost ? { ...prevPost, [name]: value } : null));
    };

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setPostData((prevPost: any) => (prevPost ? { ...prevPost, [name]: value } : null));
    };

    const handleEditorChange = (text: string) => {
        setPostData((prevPost: any) => (prevPost ? { ...prevPost, content: text } : null));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!postData) return;

        try {
            setLoading(true);
            const updatedPost = await prisma.post.update({
                where: { id: postData.id },
                data: {
                    title: postData.title,
                    content: postData.content,
                    author_id: postData.author_id,
                    category_id: postData.category_id,
                    status: postData.status,
                    slug: postData.slug,
                    excerpt: postData.excerpt,
                    featured_image_url: postData.featured_image_url,
                    tags: {
                        set: postData.tags.map((tag: any) => ({ id: tag.id })),
                    },
                },
            });

            setLoading(false);
            toast.success('Post updated successfully!');
            router.push(`/posts/${updatedPost.slug}`);
        } catch (error) {
            console.error('Failed to update post:', error);
            setError('Failed to update post');
            toast.error('Failed to update post');
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <ToastContainer />
            <h1 className="text-2xl font-bold mb-4">Edit Post</h1>
            {loading ? (
                <div className="flex justify-center items-center h-screen">
                    <ClipLoader size={50} />
                </div>
            ) : (
                postData && (
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2" htmlFor="title">
                                Title
                            </label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={postData.title}
                                onChange={handleInputChange}
                                className="border border-gray-300 p-2 w-full"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2" htmlFor="content">
                                Content
                            </label>
                            <div className="flex items-center mb-2">
                                <span className="mr-2">Markdown</span>
                                <input
                                    type="checkbox"
                                    checked={isHtmlMode}
                                    onChange={() => setIsHtmlMode(!isHtmlMode)}
                                    className="mr-2"
                                />
                                <span className="ml-2">HTML</span>
                            </div>
                            {isHtmlMode ? (
                                <textarea
                                    id="content"
                                    name="content"
                                    value={postData.content}
                                    onChange={handleInputChange}
                                    className="border border-gray-300 p-2 w-full"
                                    rows={10}
                                    required
                                />
                            ) : (
                                <MDXEditor
                                    markdown={postData.content}
                                    onChange={handleEditorChange}
                                    className="border border-gray-300 p-2 w-full"
                                />
                            )}
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2" htmlFor="author_id">
                                Author
                            </label>
                            <select
                                id="author_id"
                                name="author_id"
                                value={postData.author_id || ''}
                                onChange={handleSelectChange}
                                className="border border-gray-300 p-2 w-full"
                            >
                                <option value="">Select Author</option>
                                {authors.map((author) => (
                                    <option key={author.id} value={author.id}>
                                        {author.username}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2" htmlFor="category_id">
                                Category
                            </label>
                            <select
                                id="category_id"
                                name="category_id"
                                value={postData.category_id || ''}
                                onChange={handleSelectChange}
                                className="border border-gray-300 p-2 w-full"
                            >
                                <option value="">Select Category</option>
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2" htmlFor="status">
                                Status
                            </label>
                            <select
                                id="status"
                                name="status"
                                value={postData.status}
                                onChange={handleSelectChange}
                                className="border border-gray-300 p-2 w-full"
                            >
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                                <option value="archived">Archived</option>
                            </select>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2" htmlFor="excerpt">
                                Excerpt
                            </label>
                            <textarea
                                id="excerpt"
                                name="excerpt"
                                value={postData.excerpt || ''}
                                onChange={handleInputChange}
                                className="border border-gray-300 p-2 w-full"
                                rows={3}
                            ></textarea>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2" htmlFor="featured_image_url">
                                Featured Image URL
                            </label>
                            <input
                                type="text"
                                id="featured_image_url"
                                name="featured_image_url"
                                value={postData.featured_image_url || ''}
                                onChange={handleInputChange}
                                className="border border-gray-300 p-2 w-full"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2" htmlFor="tags">
                                Tags
                            </label>
                            <select
                                id="tags"
                                name="tags"
                                value={postData.tags.map((tag: any) => tag.id)}
                                onChange={handleSelectChange}
                                className="border border-gray-300 p-2 w-full"
                                multiple
                            >
                                {tags.map((tag) => (
                                    <option key={tag.id} value={tag.id}>
                                        {tag.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex justify-end">
                            <button type="submit" className="bg-blue-500 text-white p-2 rounded flex items-center">
                                {loading ? <FaSpinner className="animate-spin mr-2" /> : <FaSave className="mr-2" />}
                                Save
                            </button>
                        </div>
                    </form>
                )
            )}
        </div>
    );
};

export const getServerSideProps = async (context: any) => {
    const { id } = context.query;

    try {
        const post = await prisma.post.findUnique({
            where: { id: parseInt(id) },
            include: {
                author: true,
                category: true,
                tags: true,
            },
        });

        const authors = await prisma.user.findMany();
        const categories = await prisma.category.findMany();
        const tags = await prisma.tag.findMany();

        // Convert Date objects to strings
        const serializeDate = (date: Date | undefined | null) => date ? date.toISOString() : null;

        // serialize post data and .post.author.created_at
        const serializedPost = {
            ...post,
            created_at: serializeDate(post?.created_at),
            updated_at: serializeDate(post?.updated_at),
            published_at: serializeDate(post?.published_at),

            // serialize author data
            author: {
                ...post?.author,
                created_at: serializeDate(post?.author?.created_at),
                updated_at: serializeDate(post?.author?.updated_at),
            },
        };

        const serializedAuthors = authors.map((author) => ({
            ...author,
            created_at: serializeDate(author.created_at),
            updated_at: serializeDate(author.updated_at),
        }));
        
        return {
            props: {
                post: serializedPost,
                authors: serializedAuthors,
                categories,
                tags,
            },
        };
    } catch (error) {
        console.error('Failed to fetch data:', error);
        return {
            props: {
                post: null,
                authors: [],
                categories: [],
                tags: [],
            },
        };
    }
};

export default EditPost;