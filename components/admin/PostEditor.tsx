// components/PostEditor.tsx
import React, { useState, useRef } from 'react';
import { FaSave } from 'react-icons/fa';
import Editor from "@/components/admin/Editor";
import RenderMdx from '@/components/Blog/RenderMdx';
import { MDXRemoteSerializeResult } from 'next-mdx-remote';
import { serialize } from 'next-mdx-remote/serialize';
import { getOptions } from "@/lib/articles/mdxconfig";
import Image from 'next/image';
import CustomImage from '@/components/CustomImage';

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

interface PostEditorProps {
    post: Post;
    tags: Tag[];
    categories: Category[];
    onSave: (post: Post) => void;
}


const PostEditor: React.FC<PostEditorProps> = ({ post, tags, categories, onSave }) => {
    const [mdxSource, setMdxSource] = useState<MDXRemoteSerializeResult | null>(null);
    const [currentPost, setCurrentPost] = useState<Post>(post);
    const [markdownText, setMarkdownText] = useState<string>(post.content);
    const previewRef = useRef<HTMLDivElement>(null);

    // set initial mdx source
    if (!mdxSource)
        serialize(post.content, getOptions(false) as any).then((mdx) => {
            setMdxSource(mdx);
        });

    const handleContentChange = (value: string) => {
        setMarkdownText(value);
        serialize(value, getOptions(false) as any).then((mdx) => {
            setMdxSource(mdx);
            setCurrentPost({ ...currentPost, content: value });
        });
    };

    const handleFieldChange = (field: keyof Post, value: any) => {
        if (field === 'tags') {
            const selectedTags = value.map((tagId: number) => tags.find(tag => tag.id === tagId));
            setCurrentPost({ ...currentPost, tags: selectedTags });
        } else if (field === 'category') {
            const selectedCategory = categories.find(category => category.id === value);
            setCurrentPost({ ...currentPost, category: selectedCategory || { id: 0, name: '' } });
        } else {
            setCurrentPost({ ...currentPost, [field]: value });
        }
    };

    const onSaveListener = () => {
        onSave(currentPost);
    };

    const mdxComponents = (featuredImageUrl: string) => ({
        Image: (props: any) => <CustomImage {...props} />,
        img: (props: any) => <CustomImage {...props} />,
    });

    const handleEditorScroll = (e: React.UIEvent<HTMLTextAreaElement | HTMLDivElement>, type: 'md' | 'html') => {
        if (type === 'md' && previewRef.current) {
            const editorElement = e.target as HTMLTextAreaElement | HTMLDivElement;
            const scrollPercentage = editorElement.scrollTop / (editorElement.scrollHeight - editorElement.clientHeight);
            previewRef.current.scrollTop = scrollPercentage * (previewRef.current.scrollHeight - previewRef.current.clientHeight);
        }
    };

    return (
        <div className="flex flex-col">
            <div className="mb-4">
                <label className="block text-gray-700">Title</label>
                <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded"
                    value={currentPost.title || ''}
                    onChange={(e) => handleFieldChange('title', e.target.value)}
                />
            </div>
            <div className="flex">
                <div className="w-1/2 pr-2">
                    <label className="block text-gray-700 mb-2">Content</label>
                    <Editor
                        markdown={markdownText}
                        onChange={handleContentChange}
                        onScroll={handleEditorScroll}
                    />
                </div>
                <div className="w-1/2 pl-2">
                    <h2 className="text-xl font-bold mb-2">Preview</h2>
                    <div ref={previewRef} style={{ height: '500px', overflowY: 'scroll' }}>
                        {mdxSource ? (
                            <RenderMdx mdxSource={mdxSource} additionalComponents={mdxComponents(currentPost.featured_image_url)} />
                        ) : (
                            <p>No preview available</p>
                        )}
                    </div>
                </div>
            </div>
            <div className="mb-4">
                <label className="block text-gray-700">Tags</label>
                <select
                    multiple
                    className="w-full p-2 border border-gray-300 rounded"
                    value={currentPost.tags?.map(tag => String(tag.id)) || []}
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
                <label className="block text-gray-700">Category</label>
                <select
                    className="w-full p-2 border border-gray-300 rounded"
                    value={currentPost.category?.id || ''}
                    onChange={(e) =>
                        handleFieldChange('category', Number(e.target.value))
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
                className="bg-blue-500 text-white p-2 rounded w-full mb-4"
                onClick={onSaveListener}
            >
                <FaSave className="inline mr-2" />
                Save
            </button>

        </div>
    );
};

export default PostEditor;