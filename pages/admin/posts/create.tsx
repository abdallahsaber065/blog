import React, { useState, useEffect } from 'react';
import axios from 'axios';
import readingTime from "reading-time";
import { ClipLoader } from 'react-spinners';
import { toast } from 'react-hot-toast';
import { slug } from "github-slugger";
import { useSession } from 'next-auth/react';
import PostForm from '@/components/Admin/CreatePost/PostForm';
import withAuth from '@/components/Admin/withAuth';
import { useRouter } from 'next/router';
import AIContentGenerator from '@/components/Admin/CreatePost/AIContentGenerator';
import TourGuide from '@/components/Admin/CreatePost/CreateTourGuide';
import { Save, CheckCircle, ArrowRight, Loader2, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';


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
    } else
        if (ApproveRoles.includes(role)) {
            return status;
        } else {
            return 'pending';
        }
}

const CreatePost: React.FC = () => {
    const [showAIGenerator, setShowAIGenerator] = useState(false);
    const [topic, setTopic] = useState('');
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

    const [userCustomInstructions, setUserCustomInstructions] = useState('');
    const [showTour, setShowTour] = useState(false);
    const [includeImages, setIncludeImages] = useState(false);
    const [selectedImages, setSelectedImages] = useState<string[]>([]);

    const [isRedirecting, setIsRedirecting] = useState(false);
    const [savedPostId, setSavedPostId] = useState<number | null>(null);

    // Inside the CreatePost component
    const router = useRouter();

    const setFeaturedImageFromSelector = (image: ImageProps) => {
        setFeaturedImage(image.file_url);
    }

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

    /**
     * New single-step generation flow:
     *  1. Research topic with Google Search grounding
     *  2. Stream the full blog post
     *  3. Generate metadata
     */
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

            // SSE streaming from the Edge Function
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

            // Generate metadata
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
            setFeaturedImage('/blogs/placeholder.webp');

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
    }

    return (
        <div className="container mx-auto p-4 bg-card text-foreground">
            <TourGuide
                run={showTour}
                onFinish={() => setShowTour(false)}
                setShowAIGenerator={setShowAIGenerator}
                setShowContentSettings={() => { }}
            />

            <div className="flex items-center justify-between mb-6 pb-4 border-b border-lightBorder dark:border-darkBorder">
                <h1 className="text-3xl font-display font-bold text-foreground">Create New Post</h1>
                <button
                    className="flex items-center gap-2 px-4 py-2 text-gold dark:text-goldLight hover:bg-gold/10 dark:hover:bg-gold/15 rounded-lg transition-all duration-200 border border-gold/30 dark:border-gold/40"
                    onClick={() => setShowTour(true)}
                >
                    <span className="text-lg">❔</span>
                    <span className="font-medium">Show Guide</span>
                </button>
            </div>

            <div className="mb-6">
                <motion.button
                    className={`ai-generator-toggle relative flex items-center gap-3 px-5 py-3 font-semibold rounded-xl transition-all duration-300 overflow-hidden group ${showAIGenerator
                        ? 'bg-gold/15 border border-gold/40 text-gold hover:bg-gold/20'
                        : 'bg-gradient-to-r from-gold/10 to-gold/5 border border-gold/30 text-gold hover:from-gold/20 hover:to-gold/10 hover:border-gold/50'
                        }`}
                    onClick={() => setShowAIGenerator(!showAIGenerator)}
                    whileTap={{ scale: 0.97 }}
                    whileHover={{ scale: 1.02 }}
                >
                    {/* Subtle shimmer on hover */}
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-gold/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none" />
                    {showAIGenerator ? (
                        <>
                            <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-gold/10 border border-gold/20">
                                <X className="w-4 h-4" />
                            </span>
                            <span>Hide AI Generator</span>
                        </>
                    ) : (
                        <>
                            <span className="relative w-8 h-8 flex items-center justify-center rounded-lg bg-gold/10 border border-gold/20">
                                <Sparkles className="w-4 h-4" />
                                <span className="absolute -inset-0.5 rounded-lg border border-gold/30 animate-ping opacity-40 pointer-events-none" />
                            </span>
                            <span>Generate with AI</span>
                            <span className="ml-auto text-[10px] uppercase tracking-widest font-bold text-gold/60 bg-gold/10 px-2 py-0.5 rounded-full border border-gold/20">Beta</span>
                        </>
                    )}
                </motion.button>
            </div>

            <AnimatePresence mode="wait">
                {showAIGenerator && (
                    <motion.div
                        key="ai-generator"
                        initial={{ opacity: 0, y: -12, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.98 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <AIContentGenerator
                            className="outline-settings"
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

            <PostForm
                className="post-form"
                title={title}
                setTitle={setTitle}
                excerpt={excerpt}
                setExcerpt={setExcerpt}
                content={content}
                setContent={setContent}
                tags={tags}
                setTags={setTags}
                category={category}
                setCategory={setCategory}
                featuredImage={featuredImage}
                setFeaturedImage={setFeaturedImageFromSelector}
                oldTags={oldTags}
                oldCategories={oldCategories}
                isMounted={isMounted}
            />

            <div className="publish-buttons flex gap-4 pt-6 border-t border-lightBorder dark:border-darkBorder mt-6">
                <button
                    className="flex-1 h-11 px-6 bg-gold hover:bg-goldDark text-slate-900 dark:text-slate-900 font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    onClick={handlePublish}
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <ClipLoader size={18} color={"#fff"} />
                            <span>Publishing...</span>
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4" />
                            <span>Publish</span>
                        </>
                    )}
                </button>
                <button
                    className="flex-1 h-11 px-6 bg-darkElevated hover:bg-darkBorder text-foreground font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    onClick={handleSaveDraft}
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <ClipLoader size={18} color={"currentColor"} />
                            <span>Saving...</span>
                        </>
                    ) : (
                        <span>Save Draft</span>
                    )}
                </button>
            </div>
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