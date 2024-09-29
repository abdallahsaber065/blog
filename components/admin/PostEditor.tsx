// components/PostEditor.tsx
import React, { useState } from 'react';
import { FaSave } from 'react-icons/fa';
import Editor from "@/components/admin/Editor";
import { serialize } from 'next-mdx-remote/serialize';
import { getOptions } from "@/lib/articles/mdxconfig";
import Image from 'next/image';

interface Post {
    id: number;
    title: string;
    content: string;
    featured_image_url: string;
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

interface PostEditorProps {
    post: Post;
    tags: Tag[];
    categories: Category[];
    onChange: (field: keyof Post, value: any) => void;
    onSave: () => void;
}

const PostEditor: React.FC<PostEditorProps> = ({ post, tags, categories, onChange: onPostFieldChange, onSave }) => {
    const handleContentChange = async (value: string) => {
        console.log('content', value);
        const mdx = await serialize(
            value,
            getOptions(false) as any
        );
        onPostFieldChange('content', value);
    };

    return (
        <div className="flex flex-col md:flex-row">
            <div className="w-full pr-4">
                <h2 className="text-2xl font-bold mb-4">Edit Post</h2>
                <div className="mb-6">
                    <label className="block text-gray-700 font-semibold mb-2">Title</label>
                    <input
                        type="text"
                        className="w-full p-3 border border-gray-300 rounded-lg"
                        value={post.title || ''}
                        onChange={(e) => onPostFieldChange('title', e.target.value)}
                    />
                </div>
                <div className="mb-6">
                    <label className="block text-gray-700 font-semibold mb-2">Content</label>
                    <Editor
                        markdown={post.content || ''}
                        onChange={handleContentChange}
                    />
                </div>
                <div className="mb-6">
                    <label className="block text-gray-700 font-semibold mb-2">Tags</label>
                    <select
                        multiple
                        className="w-full p-3 border border-gray-300 rounded-lg"
                        value={post.tags?.map(String) || []}
                        onChange={(e) =>
                            onPostFieldChange(
                                'tags',
                                Array.from(e.target.selectedOptions, (option) => Number(option.value))
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
                <div className="mb-6">
                    <label className="block text-gray-700 font-semibold mb-2">Categories</label>
                    <select
                        multiple
                        className="w-full p-3 border border-gray-300 rounded-lg"
                        value={post.categories?.map(String) || []}
                        onChange={(e) =>
                            onPostFieldChange(
                                'categories',
                                Array.from(e.target.selectedOptions, (option) => Number(option.value))
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
                    className="bg-blue-500 text-white p-3 rounded-lg flex items-center"
                    onClick={onSave}
                >
                    <FaSave className="inline mr-2" />
                    Save
                </button>
            </div>
        </div>
    );
};

export default PostEditor;