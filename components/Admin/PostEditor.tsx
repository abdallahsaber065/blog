import React, { useState } from 'react';
import { FaSave } from 'react-icons/fa';
import EditorWithPreview from "@/components/Admin/EditorWithPreview";
import CreatableSelect from 'react-select/creatable';
import makeAnimated from 'react-select/animated';
import { ClipLoader } from 'react-spinners';

const animatedComponents = makeAnimated();

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
    onSave: (post: Post, status: string) => void;
}

const PostEditor: React.FC<PostEditorProps> = ({ post, tags, categories, onSave }) => {
    const [currentPost, setCurrentPost] = useState<Post>(post);
    const [markdownText, setMarkdownText] = useState<string>(post.content);
    const [loading, setLoading] = useState<boolean>(false);

    const handleContentChange = async (value: string) => {
        setMarkdownText(value);
        setCurrentPost({ ...currentPost, content: value });
    };

    const handleCreateTag = (inputValue: string) => {
        const newTag = { id: -Date.now(), name: inputValue }; // Temporary negative ID for new tags
        setCurrentPost({ 
            ...currentPost, 
            tags: [...currentPost.tags, newTag] 
        });
    };

    const handleCreateCategory = (inputValue: string) => {
        const newCategory = { id: -Date.now(), name: inputValue }; // Temporary negative ID for new category
        setCurrentPost({ 
            ...currentPost, 
            category: newCategory 
        });
    };

    const handleFieldChange = (field: keyof Post, value: any) => {
        if (field === 'tags') {
            setCurrentPost({ ...currentPost, tags: value });
        } else if (field === 'category') {
            setCurrentPost({ ...currentPost, category: value });
        } else {
            setCurrentPost({ ...currentPost, [field]: value });
        }
    };

    const handleSave = async (status: string) => {
        setLoading(true);
        await onSave(currentPost, status);
        setLoading(false);
    };

    return (
        <div className="flex flex-col">
            <div className="mb-4">
                <label className="block text-l font-bold text-gray dark:text-lightgray my-4">Title</label>
                <input
                    type="text"
                    className="w-full text-gray dark:text-lightgray bg-white dark:bg-dark p-2 border border-gray-300 rounded"
                    value={currentPost.title || ''}
                    onChange={(e) => handleFieldChange('title', e.target.value)}
                />
            </div>
            <EditorWithPreview
                markdownText={markdownText}
                onContentChange={handleContentChange}
            />
            <div className="mb-4">
                <label className="block text-l font-bold text-gray dark:text-lightgray my-4">Tags</label>
                <CreatableSelect
                    isMulti
                    components={animatedComponents}
                    className="my-react-select-container"
                    classNamePrefix="my-react-select"
                    value={currentPost.tags}
                    onChange={(selectedOptions) => handleFieldChange('tags', selectedOptions)}
                    options={tags}
                    onCreateOption={handleCreateTag}
                    getOptionLabel={(option) => option.name}
                    getOptionValue={(option) => String(option.id)}
                    formatCreateLabel={(inputValue) => `Create new tag "${inputValue}"`}
                />
            </div>
            <div className="mb-4">
                <label className="block text-l font-bold text-gray dark:text-lightgray my-4">Category</label>
                <CreatableSelect
                    components={animatedComponents}
                    className="my-react-select-container"
                    classNamePrefix="my-react-select"
                    value={currentPost.category}
                    onChange={(selectedOption) => handleFieldChange('category', selectedOption)}
                    options={categories}
                    onCreateOption={handleCreateCategory}
                    getOptionLabel={(option) => option.name}
                    getOptionValue={(option) => String(option.id)}
                    formatCreateLabel={(inputValue) => `Create new category "${inputValue}"`}
                />
            </div>
            <div className="flex space-x-4">
                <button
                    className="bg-accent text-white p-2 rounded w-full dark:bg-accentDark dark:text-gray hover:bg-accentHover"
                    onClick={() => handleSave('published')}
                    disabled={loading}
                >
                    {loading ? <ClipLoader size={20} color={"#fff"} /> : 'Publish'}
                </button>
                <button
                    className="bg-slate-500 text-white dark:text-dark p-2 rounded w-full dark:bg-slate-300  hover:bg-slate-700 dark:hover:bg-slate-200 text-bold"
                    onClick={() => handleSave('draft')}
                    disabled={loading}
                >
                    {loading ? <ClipLoader size={20} color={"#fff"} /> : 'Save Draft'}
                </button>
            </div>
        </div>
    );
};

export default PostEditor;