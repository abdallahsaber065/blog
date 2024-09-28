// components/PostEditor.tsx
import React, { useState } from 'react';
import { FaSave } from 'react-icons/fa';
import Editor from "@/components/admin/Editor";
import RenderMdx from '@/components/Blog/RenderMdx';
import { MDXRemoteSerializeResult } from 'next-mdx-remote';
import { serialize } from 'next-mdx-remote/serialize';
import { getOptions } from "@/lib/articles/mdxconfig";

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

const PostEditor: React.FC<PostEditorProps> = ({ post, tags, categories, onChange: onPostFieldChange, onSave }) => {
    const [mdxSource, setMdxSource] = useState<MDXRemoteSerializeResult | null>(null);

    const handleContentChange = async (value: string) => {
        console.log('content', value);
        onPostFieldChange('content', value);
        const mdx = await serialize(
            value,
            getOptions(false) as any
        );
        console.log('Serialized MDX:', mdx); // Debugging log
        setMdxSource(mdx);
    };

    return (
        <div className="flex">
            <div className="w-1/2 pr-4">
                <h2 className="text-xl font-bold mb-2">Edit Post</h2>
                <div className="mb-4">
                    <label className="block text-gray-700">Title</label>
                    <input
                        type="text"
                        className="w-full p-2 border border-gray-300 rounded"
                        value={post.title || ''}
                        onChange={(e) => onPostFieldChange('title', e.target.value)}
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700">Content</label>
                    <Editor
                        markdown={post.content || ''}
                        onChange={handleContentChange}
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700">Tags</label>
                    <select
                        multiple
                        className="w-full p-2 border border-gray-300 rounded"
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
                <div className="mb-4">
                    <label className="block text-gray-700">Categories</label>
                    <select
                        multiple
                        className="w-full p-2 border border-gray-300 rounded"
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
                    className="bg-blue-500 text-white p-2 rounded"
                    onClick={onSave}
                >
                    <FaSave className="inline mr-2" />
                    Save
                </button>
            </div>
            <div className="w-1/2 pl-4">
                <h2 className="text-xl font-bold mb-2">Preview</h2>
                {mdxSource ? (
                    <RenderMdx mdxSource={mdxSource} />
                ) : (
                    <p>No preview available</p>
                )}
            </div>
        </div>
    );
};

export default PostEditor;