/* eslint-disable @next/next/no-img-element */
// components/Admin/CreatePost/PostForm.tsx
import React, { useState } from 'react';
import CreatableSelect from 'react-select/creatable';
import makeAnimated from 'react-select/animated';
import EditorWithPreview from '@/components/Admin/EditorWithPreview';
import ImageSelector from '@/components/Admin/ImageSelector';

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

    const handleCreateTag = (inputValue: string) => {
        const newTag = { label: inputValue, value: inputValue };
        setTags([...tags, newTag]);
    };

    const handleCreateCategory = (inputValue: string) => {
        const newCategory = { label: inputValue, value: inputValue };
        setCategory(newCategory);
    };
    
    // Add state for image selector
    const [showImageSelector, setShowImageSelector] = useState(false);

    return (
        <div className="">
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
                        <CreatableSelect
                            isMulti
                            components={animatedComponents}
                            options={oldTags}
                            value={tags}
                            onChange={(selectedOptions) => setTags(selectedOptions as { label: string; value: string }[] || [])}
                            onCreateOption={handleCreateTag}
                            className="my-react-select-container"
                            classNamePrefix="my-react-select"
                            placeholder="Select or create tags..."
                            formatCreateLabel={(inputValue) => `Create new tag "${inputValue}"`}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-l font-bold text-gray dark:text-lightgray my-4">Category</label>
                        <CreatableSelect
                            components={animatedComponents}
                            options={oldCategories}
                            value={category}
                            onChange={(selectedOption) => setCategory(selectedOption as { label: string; value: string } | null)}
                            onCreateOption={handleCreateCategory}
                            className="my-react-select-container"
                            classNamePrefix="my-react-select"
                            placeholder="Select or create category..."
                            formatCreateLabel={(inputValue) => `Create new category "${inputValue}"`}
                        />
                    </div>
                </>
            )}
            <div className="mb-4">
                <label className="block text-l font-bold text-gray dark:text-lightgray my-4">
                    Featured Image
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                    <button
                        onClick={() => setShowImageSelector(true)}
                        className="bg-blue-500 text-white px-4 py-2 rounded"
                    >
                        Browse
                    </button>
                </div>
                {featuredImage && (
                    <img
                        src={featuredImage}
                        alt="Featured"
                        className="mt-2 max-h-40 object-cover"
                    />
                )}

                <ImageSelector
                    isOpen={showImageSelector}
                    onClose={() => setShowImageSelector(false)}
                    onSelect={setFeaturedImage}
                    currentImage={featuredImage}
                />
            </div>
        </div>
    );
};

export default PostForm;