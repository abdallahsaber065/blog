import React, { useState } from 'react';
import { FaSave } from 'react-icons/fa';
import EditorWithPreview from "@/components/admin/EditorWithPreview";
import Select from 'react-select';

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
    const [currentPost, setCurrentPost] = useState<Post>(post);
    const [markdownText, setMarkdownText] = useState<string>(post.content);

    const handleContentChange = async (value: string) => {
        setMarkdownText(value);
        setCurrentPost({ ...currentPost, content: value });
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

    const onSaveListener = () => {
        onSave(currentPost);
        
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
                <Select
                    isMulti
                    className="my-react-select-container"
                    classNamePrefix="my-react-select"
                    value={currentPost.tags}
                    onChange={(selectedOptions) => handleFieldChange('tags', selectedOptions)}
                    options={tags}
                    getOptionLabel={(option) => option.name}
                    getOptionValue={(option) => String(option.id)}
                />
            </div>
            <div className="mb-4">
                <label className="block text-l font-bold text-gray dark:text-lightgray my-4">Category</label>
                <Select
                    className="my-react-select-container"
                    classNamePrefix="my-react-select"
                    value={currentPost.category}
                    onChange={(selectedOption) => handleFieldChange('category', selectedOption)}
                    options={categories}
                    getOptionLabel={(option) => option.name}
                    getOptionValue={(option) => String(option.id)}
                />
            </div>
            <button
                className="bg-accent text-white p-2 rounded w-full dark:bg-accentDark dark:text-gray"
                onClick={onSaveListener}
            >
                <FaSave className="inline mr-2" />
                Save
            </button>
        </div>
    );
};

export default PostEditor;