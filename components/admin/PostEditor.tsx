import React, { useState } from 'react';
import { FaSave } from 'react-icons/fa';
import EditorWithPreview from "@/components/admin/EditorWithPreview";

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
                <select
                    multiple
                    className="p-2 border border-gray-300 rounded w-full text-gray dark:text-lightgray bg-white dark:bg-dark"
                    value={currentPost.tags?.map(tag => String(tag.id)) || []}
                    onChange={(e) =>
                        handleFieldChange(
                            'tags',
                            Array.from(e.target.selectedOptions, (option) => Number(option.value))
                        )
                    }
                >
                    {tags.map((tag) => (
                        <option
                            key={tag.id}
                            value={tag.id}
                            className={currentPost.tags?.some(selectedTag => selectedTag.id === tag.id) ? 'bg-accent dark:bg-accentDark dark:text-gray  font-semibold ' : ''}
                        >
                            {tag.name}
                        </option>
                    ))}
                </select>
            </div>
            <div className="mb-4">
                <label className="block text-l font-bold text-gray dark:text-lightgray my-4">Category</label>
                <select
                    className="w-full text-gray dark:text-lightgray bg-white dark:bg-dark p-2 border border-gray-300 rounded"
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