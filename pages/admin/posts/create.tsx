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
import { FaSave } from 'react-icons/fa';


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
    }: {
        contextUrls: string[];
        voiceNoteBase64: string | null;
        voiceNoteMime: string;
        selectedImages: string[];
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
                router.push(`/admin/posts/edit?id=${postId}`);
            }
        } catch (error) {
            console.error('Error saving draft:', error);
        }
    };

    return (
        <div className="container mx-auto p-4  bg-white dark:bg-dark dark:text-white text-slate-900">
            <TourGuide
                run={showTour}
                onFinish={() => setShowTour(false)}
                setShowAIGenerator={setShowAIGenerator}
                setShowContentSettings={() => {}}
            />

            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200 dark:border-slate-700">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Create New Post</h1>
                <button
                    className="flex items-center gap-2 px-4 py-2 text-gold dark:text-goldLight hover:bg-gold/10 dark:hover:bg-gold/15 rounded-lg transition-all duration-200 border border-gold/30 dark:border-gold/40"
                    onClick={() => setShowTour(true)}
                >
                    <span className="text-lg">❔</span>
                    <span className="font-medium">Show Guide</span>
                </button>
            </div>

            <div className="mb-6">
                <button
                    className="ai-generator-toggle flex items-center gap-2 px-4 py-2.5 text-gold dark:text-goldLight hover:bg-gold/10 dark:hover:bg-gold/15 font-semibold rounded-lg transition-all duration-200 border border-gold/30 dark:border-gold/40 shadow-sm"
                    onClick={() => setShowAIGenerator(!showAIGenerator)}
                >
                    {showAIGenerator ? (
                        <>
                            <span className="text-lg">✕</span>
                            <span>Hide AI Generator</span>
                        </>
                    ) : (
                        <>
                            <span className="text-lg">✨</span>
                            <span>Generate Content with AI</span>
                        </>
                    )}
                </button>
            </div>

            {showAIGenerator && (
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
            )}

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

            <div className="publish-buttons flex gap-4 pt-6 border-t border-slate-200 dark:border-slate-700 mt-6">
                <button
                    className="flex-1 h-11 px-6 bg-gold hover:bg-goldDark text-slate-900 dark:text-slate-900 font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    onClick={() => handleSave('published')}
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <ClipLoader size={18} color={"#fff"} />
                            <span>Publishing...</span>
                        </>
                    ) : (
                        <>
                            <FaSave />
                            <span>Publish</span>
                        </>
                    )}
                </button>
                <button
                    className="flex-1 h-11 px-6 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-slate-100 font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
        </div>
    );
};

export default withAuth(CreatePost, ['admin', "moderator", "editor"]);