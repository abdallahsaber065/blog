/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect } from 'react';
import EditorWithPreview from "@/components/Admin/EditorWithPreview";
import CreatableSelect from 'react-select/creatable';
import makeAnimated from 'react-select/animated';
import PostSettingsSidebar from '@/components/Admin/PostSettingsSidebar';
import { resolvePublicUrl } from '@/lib/storage';
import readingTime from "reading-time";
import {
    Save, Settings2, X, PanelRightClose, PanelRightOpen,
    Tag, FolderOpen, ImageIcon, Loader2, FileText, Eye,
} from 'lucide-react';
import { ClipLoader } from 'react-spinners';
import { motion, AnimatePresence } from 'framer-motion';

const animatedComponents = makeAnimated();

interface PostPermission {
    user_id: number | null;
    role: string | null;
}

interface Post {
    id: number;
    title: string;
    excerpt?: string;
    featured_image_url: string;
    content: string;
    tags: Tag[];
    category: Category;
    permissions?: PostPermission[];
    status?: string;
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
    const [postStatus, setPostStatus] = useState<string>(post.status || 'draft');
    const [showSettings, setShowSettings] = useState(false);
    const [isLivePreview, setIsLivePreview] = useState(false);

    const handleContentChange = async (value: string) => {
        setMarkdownText(value);
        setCurrentPost({ ...currentPost, content: value });
    };

    const handleCreateTag = (inputValue: string) => {
        const newTag = { id: -Date.now(), name: inputValue };
        setCurrentPost({
            ...currentPost,
            tags: [...currentPost.tags, newTag]
        });
    };

    const handleCreateCategory = (inputValue: string) => {
        const newCategory = { id: -Date.now(), name: inputValue };
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

    const handleSave = async () => {
        const { permissions: _permissions, status: _status, ...postData } = currentPost;
        await onSave(postData, postStatus);
    };

    // Count filled metadata fields
    const metadataCount = [
        currentPost.title,
        currentPost.category,
        currentPost.featured_image_url,
        currentPost.tags.length > 0
    ].filter(Boolean).length;

    return (
        <div className="min-h-[calc(100vh-180px)]">
            {/* ── Top Bar ── */}
            <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-lightBorder dark:border-darkBorder -mx-4 px-4">
                <div className="h-16 flex items-center justify-between gap-4">
                    {/* Title */}
                    <div className="flex-1 min-w-0 hidden sm:block">
                        <input
                            type="text"
                            className="post-editor-title-input w-full text-xl sm:text-2xl font-display font-bold bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground/40 truncate"
                            placeholder="Post title…"
                            value={currentPost.title || ''}
                            onChange={(e) => handleFieldChange('title', e.target.value)}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Live Preview Button */}
                        <button
                            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold bg-success/10 text-success border border-success/30 hover:bg-success/20 transition-all duration-200"
                            onClick={() => setIsLivePreview(true)}
                            title="Open full screen Live Preview"
                        >
                            <Eye className="w-4 h-4" />
                            <span className="hidden sm:inline">Preview</span>
                        </button>

                        {/* Settings toggle */}
                        <button
                            className={`relative flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${showSettings
                                ? 'bg-gold/15 border border-gold/40 text-gold'
                                : 'bg-card border border-lightBorder dark:border-darkBorder text-muted-foreground hover:text-foreground hover:border-gold/40'
                                }`}
                            onClick={() => setShowSettings(!showSettings)}
                        >
                            {showSettings ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
                            <span className="hidden sm:inline">Settings</span>
                            {metadataCount > 0 && !showSettings && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-[10px] font-bold bg-gold text-dark rounded-full">
                                    {metadataCount}
                                </span>
                            )}
                        </button>

                        {/* Status + Save */}
                        <div className="flex items-center gap-2 ml-1">
                            {/* Status toggle pill */}
                            <button
                                type="button"
                                onClick={() => setPostStatus(postStatus === 'published' ? 'draft' : 'published')}
                                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 border ${postStatus === 'published'
                                    ? 'bg-success/10 border-success/30 text-success'
                                    : 'bg-card border-lightBorder dark:border-darkBorder text-muted-foreground'
                                    }`}
                            >
                                <span className={`w-2 h-2 rounded-full ${postStatus === 'published' ? 'bg-success' : 'bg-muted-foreground'}`} />
                                {postStatus === 'published' ? 'Published' : 'Draft'}
                            </button>

                            {/* Save button */}
                            <button
                                className="post-editor-actions h-9 px-5 bg-gold hover:bg-goldDark text-dark text-sm font-bold rounded-xl transition-all duration-200 shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                onClick={handleSave}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <ClipLoader size={14} color={"#1a1a1a"} />
                                        <span>Saving…</span>
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-3.5 h-3.5" />
                                        <span>Save</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Main Content ── */}
            <div className="flex mt-4">
                {/* Editor */}
                <div className="flex-1 min-w-0">
                    <EditorWithPreview
                        markdownText={markdownText}
                        onContentChange={handleContentChange}
                        title={currentPost.title}
                        category={currentPost.category ? { label: currentPost.category.name, value: String(currentPost.category.id) } : null}
                        tags={currentPost.tags.map(tag => ({ label: tag.name, value: String(tag.id) }))}
                        featuredImage={currentPost.featured_image_url}
                        excerpt={currentPost.excerpt || ''}
                        isLivePreview={isLivePreview}
                        setIsLivePreview={setIsLivePreview}
                        diffMarkdown={post.content}
                    />
                </div>

                {/* ── Settings Sidebar ── */}
                <PostSettingsSidebar
                    showSettings={showSettings}
                    setShowSettings={setShowSettings}
                    title={currentPost.title || ''}
                    onTitleChange={(v) => handleFieldChange('title', v)}
                    excerpt={currentPost.excerpt || ''}
                    onExcerptChange={(v) => handleFieldChange('excerpt', v)}
                    featuredImage={currentPost.featured_image_url || ''}
                    onFeaturedImageChange={(v) => handleFieldChange('featured_image_url', v)}
                    markdownText={markdownText}
                    renderTags={
                        <div className="post-editor-tags-section space-y-2">
                            <label className="post-editor-tags-label text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                <Tag className="w-3 h-3 text-gold/70" />
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
                                formatCreateLabel={(inputValue) => `Create "${inputValue}"`}
                                placeholder="Select or create tags..."
                            />
                        </div>
                    }
                    renderCategory={
                        <div className="post-editor-category-section space-y-2">
                            <label className="post-editor-category-label text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                <FolderOpen className="w-3 h-3 text-gold/70" />
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
                                formatCreateLabel={(inputValue) => `Create "${inputValue}"`}
                                placeholder="Select or create category..."
                            />
                        </div>
                    }
                />
            </div>
        </div>
    );
};

export default PostEditor;