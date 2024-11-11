// pages/admin/posts/create.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import readingTime from "reading-time";
import { ClipLoader } from 'react-spinners';
import { toast } from 'react-hot-toast';
import { slug } from "github-slugger";
import { useSession } from 'next-auth/react';
import JSONEditorComponent from '@/components/Admin/JSONEditor';
import LogViewer from '@/components/Admin/CreatePost/LogViewer';
import OutlineSettings from '@/components/Admin/CreatePost/OutlineSettings';
import ContentSettings from '@/components/Admin/CreatePost/ContentSettings';
import PostForm from '@/components/Admin/CreatePost/PostForm';
import withAuth from '@/components/Admin/withAuth';

const CONTENT_GENERATOR_API_LINK = process.env.CONTENT_GENERATOR_API_LINK || 'http://localhost:5000';

interface ImageProps {
    id: string;
    file_name: string;
    file_type: string;
    file_size: number;
    file_url: string;
    width: number;
    height: number;
}

const CreatePost: React.FC = () => {
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

    const [showOutlineSettings, setShowOutlineSettings] = useState(false);
    const [showContentSettings, setShowContentSettings] = useState(false);
    const [searchTerms, setSearchTerms] = useState('');
    const [numOfTerms, setNumOfTerms] = useState(3);
    const [numOfKeywords, setNumOfKeywords] = useState(20);
    const [numOfPoints, setNumOfPoints] = useState(5);
    const [enableNumOfPoints, setEnableNumOfPoints] = useState(false);
    const [userCustomInstructions, setUserCustomInstructions] = useState('');
    const [outline, setOutline] = useState<any>(null);
    const [outlineDraft, setOutlineDraft] = useState<any>(null);
    const [includeSearchTerms, setIncludeSearchTerms] = useState(true);
    const [showJSONEditor, setShowJSONEditor] = useState(false);
    const [showLogViewer, setShowLogViewer] = useState(false);

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
                throw new Error("Please enter a topic to generate content.");
            }

            const outlineResponse = await axios.post(`${CONTENT_GENERATOR_API_LINK}/generate_outline`, {
                topic,
                num_of_terms: includeSearchTerms ? numOfTerms : 0,
                num_of_keywords: numOfKeywords,
                user_custom_instructions: userCustomInstructions,
                num_of_points: enableNumOfPoints ? numOfPoints : null,
            });

            const outline = outlineResponse.data?.outline;
            setSearchTerms(outlineResponse.data?.search_terms);

            if (!outline) {
                throw new Error("No outline generated. Please try again.");
            }

            setOutline(outline);
            setShowJSONEditor(true);
        } catch (error: any) {
            console.error('Error during outline generation:', error);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptOutline = async () => {
        setLoading(true);
        try {
            const contentResponse = await axios.post(`${CONTENT_GENERATOR_API_LINK}/generate_content`, {
                topic,
                outline,
                search_terms: searchTerms,
                user_custom_instructions: userCustomInstructions,
            });

            const generatedContent = contentResponse.data?.content;
            if (!generatedContent) {
                throw new Error("No content generated. Please try again.");
            }

            setContent(generatedContent);

            const metadataResponse = await axios.post(`${CONTENT_GENERATOR_API_LINK}/generate_metadata`, {
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
        } catch (error: any) {
            console.error('Error during content generation:', error);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
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
                        where: { slug: slug(category?.value || '') },
                        create: { name: category?.value || '', slug: slug(category?.value || '') }
                    }
                },
                author: {
                    connect: { id: parseInt(session?.user?.id || '5') }
                },
                featured_image_url: featuredImage,
                status: 'published',
                published_at: new Date(),
                reading_time: Math.round(readingTime(content).minutes),
                outline: JSON.stringify(outline),
            };

            let uniqueSlug = postData.slug;
            let isUnique = false;

            while (!isUnique) {
                const response = await axios.get(`/api/posts?where=${JSON.stringify({ slug: uniqueSlug })}`);
                if (response.data.length === 0) {
                    isUnique = true;
                } else {
                    uniqueSlug = `${postData.slug}-${Date.now()}`;
                    toast.error('Title is not unique. Changing slug to make it unique.');
                }
            }

            postData.slug = uniqueSlug;
            await axios.post('/api/posts', postData);
            toast.success('Post created successfully!');
        } catch (error: any) {
            console.error('Failed to create post:', error);
            toast.error(error.response?.data?.error || error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Create New Post</h1>

            <OutlineSettings
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
                showOutlineSettings={showOutlineSettings}
                setShowOutlineSettings={setShowOutlineSettings}
            />

            <ContentSettings
                userCustomInstructions={userCustomInstructions}
                setUserCustomInstructions={setUserCustomInstructions}
                showContentSettings={showContentSettings}
                setShowContentSettings={setShowContentSettings}
            />
            
            <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0 mb-4">
                <button
                    className="bg-blue-500 text-white font-bold p-2 rounded hover:bg-blue-600"
                    onClick={handleGenerateOutline}
                    disabled={loading}
                >
                    {loading ? <ClipLoader size={20} color={"#fff"} /> : 'Generate Outline'}
                </button>

                <button
                    className="bg-yellow-500 text-white font-bold p-2 rounded hover:bg-yellow-600"
                    onClick={() => setShowJSONEditor(true)}
                >
                    Edit Outline
                </button>

                {outline && (
                    <button
                        className="bg-green-500 text-white font-bold p-2 rounded hover:bg-green-600"
                        onClick={handleAcceptOutline}
                        disabled={loading}
                    >
                        {loading ? <ClipLoader size={20} color={"#fff"} /> : 'Generate Content'}
                    </button>
                )}

                <button
                    className="bg-slate-500 text-white font-bold p-2 rounded hover:bg-slate-600"
                    onClick={() => setShowLogViewer(true)}
                >
                    View Logs
                </button>

                <div className="flex items-center">
                    <input
                        type="checkbox"
                        className="mr-2"
                        checked={includeSearchTerms}
                        onChange={() => setIncludeSearchTerms(!includeSearchTerms)}
                    />
                    <label className="text-gray dark:text-lightgray">Include Search Terms</label>
                </div>
            </div>

            <PostForm
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

            <div className="flex space-x-4">
                <button
                    className="bg-accent text-white p-2 rounded w-full dark:bg-accentDark dark:text-gray"
                    onClick={handleSave}
                    disabled={loading}
                >
                    {loading ? <ClipLoader size={20} color={"#fff"} /> : 'Save'}
                </button>
            </div>

            {showJSONEditor && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-4 rounded shadow-lg w-3/4">
                        <h2 className="text-xl font-bold mb-4">Edit Outline</h2>
                        <JSONEditorComponent value={outlineDraft || outline} onChange={setOutlineDraft} />
                        <div className="flex justify-end space-x-4 mt-4">
                            <button
                                className="bg-red-500 text-white p-2 rounded"
                                onClick={() => setShowJSONEditor(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="bg-blue-500 text-white p-2 rounded"
                                onClick={handleSaveOutline}
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showLogViewer && (
                <LogViewer
                    onClose={() => setShowLogViewer(false)}
                    link='https://generate.api.devtrend.tech/logs'
                />
            )}
        </div>
    );
};

export default withAuth(CreatePost, ['admin', "moderator", "editor"]);