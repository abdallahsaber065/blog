/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect } from 'react';
import { FaSave } from 'react-icons/fa';
import EditorWithPreview from "@/components/Admin/EditorWithPreview";
import CreatableSelect from 'react-select/creatable';
import makeAnimated from 'react-select/animated';
import { ClipLoader } from 'react-spinners';
import ImageSelector from '@/components/Admin/ImageSelector';
import { Button } from '@/components/ui/button';

const animatedComponents = makeAnimated();

interface PostPermission {
    user_id: number | null;
    role: string | null;
}

interface Post {
    id: number;
    title: string;
    featured_image_url: string;
    content: string;
    tags: Tag[];
    category: Category;
    permissions?: PostPermission[];
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
    const [showImageSelector, setShowImageSelector] = useState(false);

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
        const { permissions, ...postData } = currentPost;
        const postToUpdate = {
            ...postData
        };
        
        await onSave(postToUpdate, status);
    };

    useEffect(() => {
        if (showImageSelector) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }

        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [showImageSelector]);

    return (
        <div className="post-editor-container flex flex-col space-y-6">
            {/* Title Section */}
            <div className="post-editor-title-section">
                <label className="post-editor-title-label block text-base font-semibold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-2">
                    <span className="w-1 h-5 bg-blue-500 rounded-full"></span>
                    Title
                </label>
                <input
                    type="text"
                    className="post-editor-title-input w-full text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter post title..."
                    value={currentPost.title || ''}
                    onChange={(e) => handleFieldChange('title', e.target.value)}
                />
            </div>

            {/* Editor and Preview */}
            <EditorWithPreview
                markdownText={markdownText}
                onContentChange={handleContentChange}
            />

            {/* Tags Section */}
            <div className="post-editor-tags-section">
                <label className="post-editor-tags-label block text-base font-semibold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-2">
                    <span className="w-1 h-5 bg-purple-500 rounded-full"></span>
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
                    placeholder="Select or create tags..."
                />
            </div>

            {/* Category Section */}
            <div className="post-editor-category-section">
                <label className="post-editor-category-label block text-base font-semibold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-2">
                    <span className="w-1 h-5 bg-orange-500 rounded-full"></span>
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
                    placeholder="Select or create category..."
                />
            </div>

            {/* Featured Image Section */}
            <div className="featured-image">
                <label className="block text-base font-semibold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-2">
                    <span className="w-1 h-5 bg-green-500 rounded-full"></span>
                    Featured Image
                </label>
                <Button
                    onClick={() => setShowImageSelector(true)}
                    variant="outline"
                    className="mb-3"
                >
                    Browse Images
                </Button>
                {currentPost.featured_image_url && (
                    <div className="border border-slate-300 dark:border-slate-600 rounded-lg overflow-hidden shadow-sm">
                        <img
                            src={currentPost.featured_image_url}
                            alt="Featured"
                            className="featured-image-preview w-full max-h-64 object-cover"
                        />
                    </div>
                )}

                <ImageSelector
                    isOpen={showImageSelector}
                    onClose={() => setShowImageSelector(false)}
                    onSelect={(image) => handleFieldChange('featured_image_url', image.file_url)}
                    currentImage={currentPost.featured_image_url}
                    folder='blog'
                />
            </div>

            {/* Action Buttons */}
            <div className="post-editor-actions flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                <Button
                    className="flex-1 h-11"
                    onClick={() => handleSave('published')}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <span className="flex items-center gap-2">
                            <ClipLoader size={18} color={"#fff"} />
                            <span>Publishing...</span>
                        </span>
                    ) : (
                        <span className="flex items-center gap-2">
                            <FaSave />
                            <span>Publish</span>
                        </span>
                    )}
                </Button>
                <Button
                    variant="secondary"
                    className="flex-1 h-11"
                    onClick={() => handleSave('draft')}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <span className="flex items-center gap-2">
                            <ClipLoader size={18} color={"#fff"} />
                            <span>Saving...</span>
                        </span>
                    ) : (
                        <span>Save Draft</span>
                    )}
                </Button>
            </div>
        </div>
    );
};

export default PostEditor;