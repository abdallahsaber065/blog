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
    onSave: (updatedPost: any, status: string) => Promise<void>;
    isLoading: boolean;
}

const PostEditor: React.FC<PostEditorProps> = ({ post, tags, categories, onSave, isLoading }) => {
    const [currentPost, setCurrentPost] = useState<Post>(post);
    const [markdownText, setMarkdownText] = useState<string>(post.content);

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
        await onSave(currentPost, status);
    };

    return (
        <div className="post-editor-container flex flex-col">
            <div className="post-editor-title-section mb-4">
                <label className="post-editor-title-label block text-l font-bold text-gray dark:text-lightgray my-4">
                    Title
                </label>
                <input
                    type="text"
                    className="post-editor-title-input w-full text-gray dark:text-lightgray bg-white dark:bg-dark p-2 border border-slate-300 rounded"
                    value={currentPost.title || ''}
                    onChange={(e) => handleFieldChange('title', e.target.value)}
                />
            </div>
            <EditorWithPreview
                markdownText={markdownText}
                onContentChange={handleContentChange}
            />
            <div className="post-editor-tags-section mb-4">
                <label className="post-editor-tags-label block text-l font-bold text-gray dark:text-lightgray my-4">
                    Tags
                </label>
                <CreatableSelect
                    isMulti
                    components={animatedComponents}
                    className="post-editor-tags-select my-react-select-container"
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
            <div className="post-editor-category-section mb-4">
                <label className="post-editor-category-label block text-l font-bold text-gray dark:text-lightgray my-4">
                    Category
                </label>
                <CreatableSelect
                    components={animatedComponents}
                    className="post-editor-category-select my-react-select-container"
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
            <div className="post-editor-actions flex space-x-4">
                <button
                    className="post-editor-publish-btn bg-accent text-white p-2 rounded w-full dark:bg-accentDark dark:text-gray hover:bg-accentHover"
                    onClick={() => handleSave('published')}
                    disabled={isLoading}
                >
                    {isLoading ? <ClipLoader size={20} color={"#fff"} /> : 'Publish'}
                </button>
                <button
                    className="post-editor-draft-btn bg-slate-500 text-white dark:text-dark p-2 rounded w-full dark:bg-slate-300  hover:bg-slate-700 dark:hover:bg-slate-200 text-bold"
                    onClick={() => handleSave('draft')}
                    disabled={isLoading}
                >
                    {isLoading ? <ClipLoader size={20} color={"#fff"} /> : 'Save Draft'}
                </button>
            </div>
        </div>
    );
};

export default PostEditor;