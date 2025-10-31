import React, { useState, useEffect } from 'react';
import axios from 'axios';
import readingTime from "reading-time";
import { ClipLoader } from 'react-spinners';
import { toast } from 'react-hot-toast';
import { slug } from "github-slugger";
import { useSession } from 'next-auth/react';
import JSONEditorComponent from '@/components/Admin/JSONEditor';
import PostForm from '@/components/Admin/CreatePost/PostForm';
import withAuth from '@/components/Admin/withAuth';
import { useRouter } from 'next/router';
import AIContentGenerator from '@/components/Admin/CreatePost/AIContentGenerator';
import TourGuide from '@/components/Admin/CreatePost/CreateTourGuide';
import { FaSave } from 'react-icons/fa';

// Using Next.js API routes for AI content generation

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

    const [showContentSettings, setShowContentSettings] = useState(false);
    const [searchTerms, setSearchTerms] = useState('');
    const [numOfTerms, setNumOfTerms] = useState(3);
    const [numOfKeywords, setNumOfKeywords] = useState(20);
    const [numOfPoints, setNumOfPoints] = useState(5);
    const [enableNumOfPoints, setEnableNumOfPoints] = useState(false);
    const [userCustomInstructions, setUserCustomInstructions] = useState('');
    const [outline, setOutline] = useState<any>(null);
    const [outlineDraft, setOutlineDraft] = useState<any>(null);
    const [includeSearchTerms, setIncludeSearchTerms] = useState(false);
    const [showJSONEditor, setShowJSONEditor] = useState(false);
    const [showTour, setShowTour] = useState(false);

    const [includeImages, setIncludeImages] = useState(false);

    const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
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

    const handleSaveOutline = () => {
        setOutline(outlineDraft || outline);
        setShowJSONEditor(false);
    };

    const handleGenerateOutline = async () => {
        setLoading(true);
        try {
            if (!topic) {
                toast.dismiss();
                throw new Error("Please enter a topic to generate content.");
            }

            // combine selected files and images in one array
            const filesAndImages = [...selectedFiles, ...selectedImages];
            const outlineResponse = await axios.post('/api/ai/generate-outline', {
                topic,
                num_of_terms: includeSearchTerms ? numOfTerms : 0,
                num_of_keywords: numOfKeywords,
                user_custom_instructions: userCustomInstructions,
                num_of_points: enableNumOfPoints ? numOfPoints : null,
                website_type: 'blog',
                files: filesAndImages.length > 0 ? filesAndImages : null
            });

            const outline = outlineResponse.data?.outline;
            setSearchTerms(outlineResponse.data?.search_terms);

            if (!outline) {
                toast.dismiss();
                throw new Error("No outline generated. Please try again.");
            }

            setOutline(outline);
            setShowJSONEditor(true);
        } catch (error: any) {
            console.error('Error during outline generation:', error);
            toast.dismiss();
            if (error.response?.status === 500) {
                toast.error(error.response?.data?.error || "Server error. Please try again later.");
            } else if (error.message.includes("timeout")) {
                toast.error("Request timed out. Please try again.");
            } else {
                toast.error(error.response?.data?.error || error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptOutline = async () => {
        setLoading(true);
        try {
            const filesAndImages = [...selectedFiles, ...selectedImages];
            
            // Make POST request to trigger content generation with streaming
            const response = await fetch('/api/ai/generate-content', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    topic,
                    outline,
                    search_terms: searchTerms,
                    include_images: includeImages,
                    user_custom_instructions: userCustomInstructions,
                    website_type: 'blog',
                    files: filesAndImages.length > 0 ? filesAndImages : null
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
                    const lines = chunk.split('\n');

                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            try {
                                const data = JSON.parse(line.slice(6));
                                if (data.error) {
                                    throw new Error(data.error);
                                }
                                if (data.chunk) {
                                    generatedContent += data.chunk;
                                    setContent(generatedContent); // Update content in real-time
                                }
                                if (data.done && data.content) {
                                    generatedContent = data.content;
                                }
                            } catch (parseError) {
                                // Ignore parsing errors for incomplete chunks
                            }
                        }
                    }
                }
            }

            if (!generatedContent) {
                throw new Error("No content generated. Please try again.");
            }

            setContent(generatedContent);

            // Generate metadata
            const metadataResponse = await axios.post('/api/ai/generate-metadata', {
                topic,
                content: generatedContent,
                old_tags: oldTags.map(tag => tag.value),
                old_categories: oldCategories.map(category => category.value),
            });

            const { title: generatedTitle = '', excerpt = '', tags = [], main_category = '' } = metadataResponse.data;

            setTitle(generatedTitle);
            setExcerpt(excerpt);
            setTags(tags.map((tag: string) => ({ label: tag, value: tag })));
            setCategory(main_category ? { label: main_category, value: main_category } : null);
            setFeaturedImage('/blogs/placeholder.jpg');
            
            toast.success('Content generated successfully!');
        } catch (error: any) {
            console.error('Error during content generation:', error);
            toast.dismiss();
            toast.error(error.message || 'Failed to generate content');
        } finally {
            setLoading(false);
        }
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
                outline: JSON.stringify(outline),
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

    const handleFileSelection = (files: string[]) => {
        setSelectedFiles(files);
    };

    const handleImageSelection = (images: string[]) => {
        setSelectedImages(images);
    };

    return (
        <div className="container mx-auto p-4  bg-white dark:bg-dark dark:text-white text-slate-900">
            <TourGuide
                run={showTour}
                onFinish={() => setShowTour(false)}
                setShowAIGenerator={setShowAIGenerator}
                setShowContentSettings={setShowContentSettings}
            />

            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200 dark:border-slate-700">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Create New Post</h1>
                <button
                    className="flex items-center gap-2 px-4 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200 border border-blue-200 dark:border-blue-800"
                    onClick={() => setShowTour(true)}
                >
                    <span className="text-lg">❔</span>
                    <span className="font-medium">Show Guide</span>
                </button>
            </div>

            <div className="mb-6">
                <button
                    className="ai-generator-toggle flex items-center gap-2 px-4 py-2.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-semibold rounded-lg transition-all duration-200 border border-blue-200 dark:border-blue-800 shadow-sm"
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
                    numOfTerms={numOfTerms}
                    setNumOfTerms={setNumOfTerms}
                    numOfKeywords={numOfKeywords}
                    setNumOfKeywords={setNumOfKeywords}
                    numOfPoints={numOfPoints}
                    setNumOfPoints={setNumOfPoints}
                    enableNumOfPoints={enableNumOfPoints}
                    setEnableNumOfPoints={setEnableNumOfPoints}
                    userCustomInstructions={userCustomInstructions}
                    setUserCustomInstructions={setUserCustomInstructions}
                    showContentSettings={showContentSettings}
                    setShowContentSettings={setShowContentSettings}
                    loading={loading}
                    outline={outline}
                    outlineDraft={outlineDraft}
                    setOutlineDraft={setOutlineDraft}
                    showJSONEditor={showJSONEditor}
                    setShowJSONEditor={setShowJSONEditor}
                    includeSearchTerms={includeSearchTerms}
                    setIncludeSearchTerms={setIncludeSearchTerms}
                    handleGenerateOutline={handleGenerateOutline}
                    handleAcceptOutline={handleAcceptOutline}
                    handleSaveOutline={handleSaveOutline}
                    includeImages={includeImages}
                    setIncludeImages={setIncludeImages}
                    onFileSelect={handleFileSelection}
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
                    className="flex-1 h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

            {showJSONEditor && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-4xl">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Edit Outline</h2>
                        </div>
                        <div className="p-6">
                            <JSONEditorComponent value={outlineDraft || outline} onChange={setOutlineDraft} />
                        </div>
                        <div className="flex justify-end gap-3 p-6 border-t border-slate-200 dark:border-slate-700">
                            <button
                                className="px-6 py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-slate-100 font-medium rounded-lg transition-all duration-200"
                                onClick={() => setShowJSONEditor(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-200 shadow-sm"
                                onClick={handleSaveOutline}
                            >
                                Save Outline
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default withAuth(CreatePost, ['admin', "moderator", "editor"]);