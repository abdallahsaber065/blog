// pages/admin/edit-posts.tsx
import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { FaSave, FaTrash, FaPlus } from 'react-icons/fa';
import { ClipLoader } from 'react-spinners';
import { Editor } from 'mdxeditor/editor';
import 'react-toastify/dist/ReactToastify.css';
import 'mdxeditor/editor.css';

const EditPosts = () => {
    const [posts, setPosts] = useState([]);
    const [tags, setTags] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedPost, setSelectedPost] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchPosts();
        fetchTags();
        fetchCategories();
    }, []);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/posts');
            const data = await response.json();
            setPosts(data);
        } catch (error) {
            toast.error('Failed to fetch posts');
        } finally {
            setLoading(false);
        }
    };

    const fetchTags = async () => {
        try {
            const response = await fetch('/api/tags');
            const data = await response.json();
            setTags(data);
        } catch (error) {
            toast.error('Failed to fetch tags');
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await fetch('/api/categories');
            const data = await response.json();
            setCategories(data);
        } catch (error) {
            toast.error('Failed to fetch categories');
        }
    };

    const handlePostChange = (field, value) => {
        setSelectedPost({ ...selectedPost, [field]: value });
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/posts/${selectedPost.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(selectedPost),
            });
            if (response.ok) {
                toast.success('Post updated successfully');
                fetchPosts();
            } else {
                toast.error('Failed to update post');
            }
        } catch (error) {
            toast.error('Failed to update post');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        setLoading(true);
        try {
            const response = await fetch(`/api/posts/${id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                toast.success('Post deleted successfully');
                fetchPosts();
            } else {
                toast.error('Failed to delete post');
            }
        } catch (error) {
            toast.error('Failed to delete post');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <ToastContainer />
            <h1 className="text-2xl font-bold mb-4">Edit Posts</h1>
            {loading && <ClipLoader />}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <h2 className="text-xl font-bold mb-2">Posts</h2>
                    <ul>
                        {posts.map((post) => (
                            <li key={post.id} className="mb-2">
                                <button
                                    className="text-blue-500"
                                    onClick={() => setSelectedPost(post)}
                                >
                                    {post.title}
                                </button>
                                <button
                                    className="text-red-500 ml-2"
                                    onClick={() => handleDelete(post.id)}
                                >
                                    <FaTrash />
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
                {selectedPost && (
                    <div>
                        <h2 className="text-xl font-bold mb-2">Edit Post</h2>
                        <div className="mb-4">
                            <label className="block text-gray-700">Title</label>
                            <input
                                type="text"
                                className="w-full p-2 border border-gray-300 rounded"
                                value={selectedPost.title}
                                onChange={(e) => handlePostChange('title', e.target.value)}
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700">Content</label>
                            <Editor
                                value={selectedPost.content}
                                onChange={(value) => handlePostChange('content', value)}
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700">Tags</label>
                            <select
                                multiple
                                className="w-full p-2 border border-gray-300 rounded"
                                value={selectedPost.tags}
                                onChange={(e) =>
                                    handlePostChange(
                                        'tags',
                                        Array.from(e.target.selectedOptions, (option) => option.value)
                                    )
                                }
                            >
                                {tags.map((tag) => (
                                    <option key={tag.id} value={tag.id}>
                                        {tag.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700">Categories</label>
                            <select
                                multiple
                                className="w-full p-2 border border-gray-300 rounded"
                                value={selectedPost.categories}
                                onChange={(e) =>
                                    handlePostChange(
                                        'categories',
                                        Array.from(e.target.selectedOptions, (option) => option.value)
                                    )
                                }
                            >
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button
                            className="bg-blue-500 text-white p-2 rounded"
                            onClick={handleSave}
                        >
                            <FaSave className="inline mr-2" />
                            Save
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EditPosts;