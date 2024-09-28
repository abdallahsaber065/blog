// components/PostEditor.tsx
import React from 'react';
import { FaSave } from 'react-icons/fa';
import Editor from "@/components/admin/Editor";

interface Post {
    id: number;
    title: string;
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

interface PostEditorProps {
    post: Post;
    tags: Tag[];
    categories: Category[];
    onChange: (field: keyof Post, value: any) => void;
    onSave: () => void;
}

const PostEditor: React.FC<PostEditorProps> = ({ post, tags, categories, onChange, onSave }) => {
    return (
        <div>
            <h2 className="text-xl font-bold mb-2">Edit Post</h2>
            <div className="mb-4">
                <label className="block text-gray-700">Title</label>
                <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded"
                    value={post.title || ''}
                    onChange={(e) => onChange('title', e.target.value)}
                />
            </div>
            <div className="mb-4">
                <label className="block text-gray-700">Content</label>
                <Editor
                    markdown={post.content || ''}
                    onChange={(value: any) => onChange('content', value)}
                />
            </div>
            <div className="mb-4">
                <label className="block text-gray-700">Tags</label>
                <select
                    multiple
                    className="w-full p-2 border border-gray-300 rounded"
                    value={post.tags?.map(String) || []}
                    onChange={(e) =>
                        onChange(
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
            <div className="mb-4">
                <label className="block text-gray-700">Categories</label>
                <select
                    multiple
                    className="w-full p-2 border border-gray-300 rounded"
                    value={post.categories?.map(String) || []}
                    onChange={(e) =>
                        onChange(
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
                className="bg-blue-500 text-white p-2 rounded"
                onClick={onSave}
            >
                <FaSave className="inline mr-2" />
                Save
            </button>
        </div>
    );
};

export default PostEditor;