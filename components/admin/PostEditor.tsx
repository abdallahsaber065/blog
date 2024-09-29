// components/PostEditor.tsx
import React, { useState } from 'react';
import { FaSave } from 'react-icons/fa';
import Editor from "@/components/admin/Editor";
import RenderMdx from '@/components/Blog/RenderMdx';
import { MDXRemoteSerializeResult } from 'next-mdx-remote';
import { serialize } from 'next-mdx-remote/serialize';
import { getOptions } from "@/lib/articles/mdxconfig";
import Image from 'next/image';

interface Post {
    id: number;
    title: string;
    featured_image_url: string;
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
    onSave: (post: Post) => void;
}

const revertChanges = (value: string) => {
    value = value.replace(/```tsx\n<Image/g, '<Image');
    value = value.replace(/\/>\n```/g, '/>');
    value = value.replace('```js\n//html', '```html');
    return value;
};

const PostEditor: React.FC<PostEditorProps> = ({ post, tags, categories, onSave }) => {
    const [mdxSource, setMdxSource] = useState<MDXRemoteSerializeResult | null>(null);
    const [currentPost, setCurrentPost] = useState<Post>(post);

    const handleContentChange = async (value: string) => {
        value = revertChanges(value);
        const mdx = await serialize(
            value,
            getOptions(false) as any
        );
        setMdxSource(mdx);
        setCurrentPost({ ...currentPost, content: value });
    };

    const handleFieldChange = (field: keyof Post, value: any) => {
        setCurrentPost({ ...currentPost, [field]: value });
    };

    const onSaveListener = () => {
        onSave(currentPost);
    };

    const mdxComponents = (featuredImageUrl: string) => ({
        Image: (props: any) => (
            <Image
                {...props}
                src={featuredImageUrl}
                alt={props.alt || 'Featured Image'}
                width={800}
                height={600}
                style={{ width: '100%', height: 'auto' }}
            />
        ),
    });

    return (
        <div className="flex">
            <div className="w-1/2 pr-4">
                <div className="mb-4">
                    <label className="block text-gray-700">Title</label>
                    <input
                        type="text"
                        className="w-full p-2 border border-gray-300 rounded"
                        value={currentPost.title || ''}
                        onChange={(e) => handleFieldChange('title', e.target.value)}
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700">Content</label>
                    <Editor
                        markdown={currentPost.content || ''}
                        onChange={handleContentChange}
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700">Tags</label>
                    <select
                        multiple
                        className="w-full p-2 border border-gray-300 rounded"
                        value={currentPost.tags?.map(String) || []}
                        onChange={(e) =>
                            handleFieldChange(
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
                        value={currentPost.categories?.map(String) || []}
                        onChange={(e) =>
                            handleFieldChange(
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
                    onClick={onSaveListener}
                >
                    <FaSave className="inline mr-2" />
                    Save
                </button>
            </div>
            <div className="w-1/2 pl-4">
                <h2 className="text-xl font-bold mb-2">Preview</h2>
                {mdxSource ? (
                    <RenderMdx mdxSource={mdxSource} additionalComponents={mdxComponents(currentPost.featured_image_url)} />
                ) : (
                    <p>No preview available</p>
                )}
            </div>
        </div>
    );
};

export default PostEditor;