import React, { useState, useEffect } from 'react';
import axios from 'axios';
import readingTime from "reading-time";
import { toast } from 'react-hot-toast';
import { slug } from "github-slugger";
import { useSession } from 'next-auth/react';
import withAuth from '@/components/Admin/withAuth';
import { useRouter } from 'next/router';
import AIContentGenerator from '@/components/Admin/CreatePost/AIContentGenerator';
import EditorWithPreview from '@/components/Admin/EditorWithPreview';
import ImageSelector from '@/components/Admin/ImageSelector';
import CreatableSelect from 'react-select/creatable';
import makeAnimated from 'react-select/animated';
import TagsSelector from '@/components/Admin/TagsSelector';
import { resolvePublicUrl } from '@/lib/storage';
import {
    Save, CheckCircle, ArrowRight, Loader2, X, Sparkles,
    Settings2, ChevronRight, PanelRightClose, PanelRightOpen,
    FileText, Tag, FolderOpen, ImageIcon, BookOpen, Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PostSettingsSidebar from '@/components/Admin/PostSettingsSidebar';

const animatedComponents = makeAnimated();

interface ImageProps {
    id: string;
    file_name: string;
    file_type: string;
    file_size: number;
    file_url: string;
    width: number;
    height: number;
}

const ApproveRoles = ['admin', 'moderator'];

const getStatusByRole = (role: string, status: string) => {
    if (status === 'draft') {
        return 'draft';
    } else if (ApproveRoles.includes(role)) {
        return status;
    } else {
        return 'pending';
    }
}

const CreatePost: React.FC = () => {
    // AI Generator
    const [showAIGenerator, setShowAIGenerator] = useState(false);
    const [topic, setTopic] = useState('');
    const [userCustomInstructions, setUserCustomInstructions] = useState('');
    const [includeImages, setIncludeImages] = useState(false);
    const [selectedImages, setSelectedImages] = useState<string[]>([]);

    // Post data
    const [title, setTitle] = useState('');
    const [excerpt, setExcerpt] = useState('');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState<{ label: string; value: string }[]>([]);
    const [category, setCategory] = useState<{ label: string; value: string } | null>(null);
    const [featuredImage, setFeaturedImage] = useState('');
    const [oldTags, setOldTags] = useState<{ label: string; value: string }[]>([]);
    const [oldCategories, setOldCategories] = useState<{ label: string; value: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const { data: session } = useSession();
    const [isMounted, setIsMounted] = useState(false);

    // UI state
    const [showTour, setShowTour] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [isLivePreview, setIsLivePreview] = useState(false);
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [savedPostId, setSavedPostId] = useState<number | null>(null);

    const router = useRouter();

    useEffect(() => {
        const fetchOldTagsAndCategories = async () => {
            const select = JSON.stringify({ name: true });
            const Tags = await axios.get(`/api/tags?select=${select}`);
            setOldTags(Tags.data.map((tag: { name: any; }) => ({ label: tag.name, value: tag.name })));
            const Categories = await axios.get(`/api/categories?select=${select}`);
            setOldCategories(Categories.data.map((category: { name: any; }) => ({ label: category.name, value: category.name })));
        };
        fetchOldTagsAndCategories();
        setIsMounted(true);
    }, []);

    const handleGenerate = async ({
        contextUrls,
        voiceNoteBase64,
        voiceNoteMime,
        selectedImages: images,
        enableWebSearch,
    }: {
        contextUrls: string[];
        voiceNoteBase64: string | null;
        voiceNoteMime: string;
        selectedImages: string[];
        enableWebSearch: boolean;
    }) => {
        if (!topic) {
            toast.error('Please enter a topic.');
            return;
        }
        setLoading(true);
        try {
            const response = await fetch('/api/ai/generate-direct', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    topic,
                    context_urls: contextUrls,
                    files: images.length > 0 ? images : undefined,
                    voice_note_base64: voiceNoteBase64 ?? undefined,
                    voice_note_mime: voiceNoteMime,
                    include_images: includeImages,
                    user_custom_instructions: userCustomInstructions,
                    website_type: 'blog',
                    enable_web_search: enableWebSearch,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to generate content');
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let generatedContent = '';

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    const chunk = decoder.decode(value);
                    for (const line of chunk.split('\n')) {
                        if (line.startsWith('data: ')) {
                            try {
                                const data = JSON.parse(line.slice(6));
                                if (data.error) throw new Error(data.error);
                                if (data.chunk) {
                                    generatedContent += data.chunk;
                                    setContent(generatedContent);
                                }
                                if (data.done && data.content) {
                                    generatedContent = data.content;
                                }
                            } catch {
                                // ignore incomplete SSE chunks
                            }
                        }
                    }
                }
            }

            if (!generatedContent) throw new Error('No content generated. Please try again.');
            setContent(generatedContent);

            const metaRes = await axios.post('/api/ai/generate-metadata', {
                topic,
                content: generatedContent,
                old_tags: oldTags.map(t => t.value),
                old_categories: oldCategories.map(c => c.value),
            });

            const { title: gTitle = '', excerpt: gExcerpt = '', tags: gTags = [], main_category = '' } = metaRes.data;
            setTitle(gTitle);
            setExcerpt(gExcerpt);
            setTags(gTags.map((t: string) => ({ label: t, value: t })));
            setCategory(main_category ? { label: main_category, value: main_category } : null);
            setFeaturedImage('/blog/placeholder.webp');

            toast.success('Content generated successfully!');
        } catch (error: any) {
            console.error('Generation error:', error);
            toast.error(error.message || 'Failed to generate content');
        } finally {
            setLoading(false);
        }
    };

    const handleImageSelection = (images: string[]) => {
        setSelectedImages(images);
    };

    const handleSave = async (status: string = "published"): Promise<number | null> => {
        setLoading(true);
        try {
            const postData = {
                title,
                slug: slug(title),
                excerpt,
                content,
                tags: {
                    connectOrCreate: tags.map(tag => ({
                        where: { slug: slug(tag.value) },
                        create: { name: tag.value, slug: slug(tag.value) }
                    }))
                },
                category: {
                    connectOrCreate: {
                        where: { slug: slug(category?.value || 'uncategorized') },
                        create: {
                            name: category?.value || 'Uncategorized',
                            slug: slug(category?.value || 'uncategorized')
                        }
                    }
                },
                author: {
                    connect: { id: parseInt(session?.user?.id || '5') }
                },
                featured_image_url: featuredImage,
                status: getStatusByRole(session?.user?.role || 'reader', status),
                published_at: status === 'published' ? new Date() : null,
                reading_time: Math.round(readingTime(content).minutes),
            };

            const response = await axios.post('/api/posts', postData);
            toast.dismiss();
            if (status === 'published') {
                toast.success('Post published successfully!');
            } else {
                toast.success('Draft saved successfully!');
            }
            return response.data.id;
        } catch (error: any) {
            console.error('Failed to create post:', error);
            const errorMessage = error.response?.data?.error || error.message;
            toast.dismiss();
            toast.error(errorMessage);
            return null;
        } finally {
            setLoading(false);
        }
    };

    const handleSaveDraft = async () => {
        try {
            const postId = await handleSave('draft');
            if (postId) {
                setSavedPostId(postId);
                setIsRedirecting(true);
                setTimeout(() => {
                    router.push(`/admin/posts/edit?id=${postId}`);
                }, 1500);
            }
        } catch (error) {
            console.error('Error saving draft:', error);
        }
    };

    const handlePublish = async () => {
        try {
            const postId = await handleSave('published');
            if (postId) {
                setSavedPostId(postId);
                setIsRedirecting(true);
                setTimeout(() => {
                    router.push(`/admin/posts/edit?id=${postId}`);
                }, 1500);
            }
        } catch (error) {
            console.error('Error publishing post:', error);
        }
    };

    const handleCreateTag = (inputValue: string) => {
        const newTag = { label: inputValue, value: inputValue };
        setTags([...tags, newTag]);
    };

    const handleCreateCategory = (inputValue: string) => {
        const newCategory = { label: inputValue, value: inputValue };
        setCategory(newCategory);
    };

    // Count filled metadata fields for badge
    const metadataCount = [title, excerpt, category, featuredImage, tags.length > 0].filter(Boolean).length;

    return (
        <div className="min-h-screen bg-background">


            {/* ── Top Bar ── */}
            <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-lightBorder dark:border-darkBorder">
                <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
                    {/* Left: Title input */}
                    <div className="flex-1 min-w-0 hidden sm:block">
                        <input
                            type="text"
                            className="post-title w-full text-xl sm:text-2xl font-display font-bold bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground/40 truncate"
                            placeholder="Post title…"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    {/* Right: Actions */}
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

                        {/* AI Generator toggle */}
                        <motion.button
                            className={`ai-generator-toggle relative flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${showAIGenerator
                                ? 'bg-gold/15 border border-gold/40 text-gold'
                                : 'bg-card border border-lightBorder dark:border-darkBorder text-muted-foreground hover:text-gold hover:border-gold/40'
                                }`}
                            onClick={() => setShowAIGenerator(!showAIGenerator)}
                            whileTap={{ scale: 0.96 }}
                        >
                            <Sparkles className="w-4 h-4" />
                            <span className="hidden sm:inline">AI</span>
                        </motion.button>

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

                        {/* Save / Publish */}
                        <div className="flex items-center gap-1.5 ml-1">
                            <button
                                className="publish-buttons h-9 px-4 bg-card hover:bg-muted text-foreground text-sm font-medium rounded-xl transition-all duration-200 border border-lightBorder dark:border-darkBorder disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                onClick={handleSaveDraft}
                                disabled={loading}
                            >
                                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                                <span>Save Draft</span>
                            </button>
                            <button
                                className="publish-buttons h-9 px-4 bg-gold hover:bg-goldDark text-dark text-sm font-bold rounded-xl transition-all duration-200 shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                onClick={handlePublish}
                                disabled={loading}
                            >
                                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                                <span>Publish</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Main Content Area ── */}
            <div className="max-w-screen-2xl mx-auto flex">
                {/* Editor Area */}
                <div className={`flex-1 min-w-0 transition-all duration-300 ${showSettings ? 'mr-0' : ''}`}>
                    {/* AI Generator Panel */}
                    <AnimatePresence mode="wait">
                        {showAIGenerator && (
                            <motion.div
                                key="ai-generator"
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                                className="px-4 sm:px-6 pt-4"
                            >
                                <AIContentGenerator
                                    className="ai-generator-toggle"
                                    topic={topic}
                                    setTopic={setTopic}
                                    userCustomInstructions={userCustomInstructions}
                                    setUserCustomInstructions={setUserCustomInstructions}
                                    includeImages={includeImages}
                                    setIncludeImages={setIncludeImages}
                                    loading={loading}
                                    onGenerate={handleGenerate}
                                    onImageSelect={handleImageSelection}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Editor */}
                    <div className="px-4 sm:px-6 py-4 post-content">
                        <EditorWithPreview
                            markdownText={content}
                            onContentChange={setContent}
                            title={title}
                            category={category}
                            tags={tags}
                            featuredImage={featuredImage}
                            excerpt={excerpt}
                            isLivePreview={isLivePreview}
                            setIsLivePreview={setIsLivePreview}
                        />
                    </div>
                </div>

                {/* ── Settings Sidebar ── */}
                <PostSettingsSidebar
                    showSettings={showSettings}
                    setShowSettings={setShowSettings}
                    title={title}
                    onTitleChange={setTitle}
                    excerpt={excerpt}
                    onExcerptChange={setExcerpt}
                    featuredImage={featuredImage}
                    onFeaturedImageChange={setFeaturedImage}
                    markdownText={content}
                    renderTags={
                        isMounted && (
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                    <Tag className="w-3 h-3 text-gold/70" />
                                    Tags
                                </label>
                                <TagsSelector
                                    value={tags}
                                    onChange={(selectedOptions) => setTags(selectedOptions || [])}
                                    options={oldTags}
                                    onCreateOption={handleCreateTag}
                                    formatCreateLabel={(inputValue) => `Create "${inputValue}"`}
                                    placeholder="Select or create tags..."
                                    data-tour="tags-select"
                                />
                            </div>
                        )
                    }
                    renderCategory={
                        isMounted && (
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                    <FolderOpen className="w-3 h-3 text-gold/70" />
                                    Category
                                </label>
                                <CreatableSelect
                                    components={animatedComponents}
                                    options={oldCategories}
                                    value={category}
                                    onChange={(selectedOption) => setCategory(selectedOption as { label: string; value: string } | null)}
                                    onCreateOption={handleCreateCategory}
                                    className="category-select my-react-select-container"
                                    classNamePrefix="my-react-select"
                                    placeholder="Select or create category..."
                                    formatCreateLabel={(inputValue) => `Create "${inputValue}"`}
                                />
                            </div>
                        )
                    }
                />
            </div>

            {/* Redirect overlay */}
            <AnimatePresence>
                {isRedirecting && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-md"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            className="bg-card border border-lightBorder dark:border-darkBorder p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                                className="w-20 h-20 bg-gold/20 rounded-full flex items-center justify-center mx-auto mb-6"
                            >
                                <CheckCircle className="w-10 h-10 text-gold" />
                            </motion.div>
                            <h2 className="text-2xl font-display font-bold mb-2">Post Created!</h2>
                            <p className="text-muted-foreground mb-8">
                                Wrapping things up and taking you to the editor...
                            </p>
                            <div className="flex items-center justify-center gap-3 text-gold animate-pulse">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span className="font-medium">Redirecting</span>
                                <ArrowRight className="w-4 h-4" />
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default withAuth(CreatePost, ['admin', "moderator", "editor"]);