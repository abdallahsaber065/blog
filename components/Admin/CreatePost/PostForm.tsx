// components/Admin/CreatePost/PostForm.tsx
import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import EditorWithPreview from '@/components/Admin/EditorWithPreview';

const animatedComponents = makeAnimated();

interface PostFormProps {
    title: string;
    setTitle: (value: string) => void;
    excerpt: string;
    setExcerpt: (value: string) => void;
    content: string;
    setContent: (value: string) => void;
    tags: { label: string; value: string }[];
    setTags: (value: { label: string; value: string }[]) => void;
    category: { label: string; value: string } | null;
    setCategory: (value: { label: string; value: string } | null) => void;
    featuredImage: string;
    setFeaturedImage: (value: string) => void;
    oldTags: { label: string; value: string }[];
    oldCategories: { label: string; value: string }[];
    isMounted: boolean;
}

const PostForm: React.FC<PostFormProps> = ({
    title,
    setTitle,
    excerpt,
    setExcerpt,
    content,
    setContent,
    tags,
    setTags,
    category,
    setCategory,
    featuredImage,
    setFeaturedImage,
    oldTags,
    oldCategories,
    isMounted,
}) => {
    const handleContentChange = async (value: string) => {
        setContent(value);
    };

    return (
        <div>
            <div className="mb-4">
                <label className="block text-l font-bold text-gray dark:text-lightgray my-4">Title</label>
                <input
                    type="text"
                    className="w-full text-gray dark:text-lightgray bg-white dark:bg-dark p-2 border border-gray-300 rounded"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
            </div>
            <div className="mb-4">
                <label className="block text-l font-bold text-gray dark:text-lightgray my-4">Excerpt</label>
                <textarea
                    className="w-full text-gray dark:text-lightgray bg-white dark:bg-dark p-2 border border-gray-300 rounded"
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                />
            </div>
            <EditorWithPreview
                markdownText={content}
                onContentChange={handleContentChange}
            />
            {isMounted && (
                <>
                    <div className="mb-4">
                        <label className="block text-l font-bold text-gray dark:text-lightgray my-4">Tags</label>
                        <Select
                            isMulti
                            components={animatedComponents}
                            options={oldTags}
                            value={tags}
                            onChange={(selectedOptions) => setTags(selectedOptions as { label: string; value: string }[] || [])}
                            className="my-react-select-container"
                            classNamePrefix="my-react-select"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-l font-bold text-gray dark:text-lightgray my-4">Category</label>
                        <Select
                            components={animatedComponents}
                            options={oldCategories}
                            value={category}
                            onChange={(selectedOption) => setCategory(selectedOption as { label: string; value: string } | null)}
                            className="my-react-select-container"
                            classNamePrefix="my-react-select"
                        />
                    </div>
                </>
            )}
            <div className="mb-4">
                <label className="block text-l font-bold text-gray dark:text-lightgray my-4">Featured Image URL</label>
                <input
                    type="text"
                    className="w-full text-gray dark:text-lightgray bg-white dark:bg-dark p-2 border border-gray-300 rounded"
                    value={featuredImage}
                    onChange={(e) => setFeaturedImage(e.target.value)}
                />
            </div>
        </div>
    );
};

export default PostForm;