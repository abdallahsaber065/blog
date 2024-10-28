import React, { useState, useEffect } from 'react';
import axios from 'axios';
import readingTime from "reading-time";
import { ClipLoader } from 'react-spinners';
import { toast } from 'react-hot-toast';
import { slug } from "github-slugger";
import { useSession } from 'next-auth/react';
import EditorWithPreview from '@/components/Admin/EditorWithPreview';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import JSONEditorComponent from '@/components/Admin/JSONEditor';
import LogViewer from '@/components/Admin/CreatePost/LogViewer';
import withAdminAuth from '@/components/Admin/withAdminAuth';
import { headers } from 'next/headers';

const animatedComponents = makeAnimated();
const CONTENT_GENERATOR_API_LINK = process.env.CONTENT_GENERATOR_API_LINK || 'http://localhost:5000';


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
    const { data: session, status } = useSession();
    const [isMounted, setIsMounted] = useState(false);

    const [showOutlineSettings, setShowOutlineSettings] = useState(false);
    const [showContentSettings, setShowContentSettings] = useState(false);

    const [searchTerms, setSearchTerms] = useState('');

    const [numOfTerms, setNumOfTerms] = useState(3);
    const [numOfKeywords, setNumOfKeywords] = useState(20);
    const [userCustomInstructions, setUserCustomInstructions] = useState('');
    const [numOfPoints, setNumOfPoints] = useState(5);

    const [outline, setOutline] = useState<any>(null);
    const [outlineDraft, setOutlineDraft] = useState<any>(null);
    const [includeSearchTerms, setIncludeSearchTerms] = useState(true);
    const [showJSONEditor, setShowJSONEditor] = useState(false);
    const [showLogViewer, setShowLogViewer] = useState(false);

    const handleSaveOutline = () => {
        console.log('Saving outline:', outlineDraft);
        console.log('Old outline:', outline);
        setOutline(outlineDraft || outline);
        setShowJSONEditor(false);
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
    }, []);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const handleContentChange = async (value: string) => {
        setContent(value);
    };

    const genrate_postData = (isDraft = false) => {
        const postData = {
            title,
            slug: slug(title),
            excerpt,
            content,
            tags: {
                connectOrCreate: tags.map(tag => ({
                    where: {
                        slug: slug(tag.value)
                    },
                    create: {
                        name: tag.value,
                        slug: slug(tag.value)
                    }
                }))
            },
            category: {
                connectOrCreate: {
                    where: {
                        slug: slug(category?.value || '')
                    },
                    create: {
                        name: category?.value || '',
                        slug: slug(category?.value || '')
                    }
                }
            },
            author: {
                connect: {
                    id: parseInt(session?.user?.id || '5')
                }
            },
            featured_image_url: featuredImage,
            status: isDraft ? 'draft' : 'published',
            published_at: isDraft ? null : new Date(),
            reading_time: Math.round(readingTime(content).minutes),
            // convert outline to JSON string
            outline: JSON.stringify(outline),
        };
        return postData;
    };

    const SavePost = async (postData: any) => {
        try {
            let uniqueSlug = postData.slug;
            let isUnique = false;

            // Check for unique slug
            while (!isUnique) {
                try {
                    const response = await axios.get(`/api/posts?where=${JSON.stringify({ slug: uniqueSlug })}`);
                    if (response.data.length === 0) {
                        isUnique = true;
                    } else {
                        uniqueSlug = `${postData.slug}-${Date.now()}`;
                        // toast to show that title is not unique
                        toast.error('Title is not unique. Changing slug to make it unique.');
                    }
                } catch (error) {
                    console.error('Error checking slug uniqueness:', error);
                    throw new Error('Failed to check slug uniqueness.');
                }
            }

            postData.slug = uniqueSlug;

            const response = await axios.post('/api/posts', postData);
            console.log("API Response:", response.data);

            toast.success('Post created successfully!');
        } catch (error: any) {
            console.error('Failed to create post:', error);

            if (error.response) {
                toast.error(`Error: ${error.response.data.error || "Server error"}`);
            } else if (error.request) {
                toast.error('No response from server. Please try again later.');
            } else {
                toast.error(`Error: ${error.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        const postData = genrate_postData();
        await SavePost(postData);
    };

    const handleGenerateOutline = async () => {
        setLoading(true);
        try {
            if (!topic) {
                throw new Error("Please enter a topic to generate content.");
            }

            if (!includeSearchTerms) {
                setNumOfTerms(0);
            } else {
                if (numOfTerms === 0) {
                    setNumOfTerms(3);
                }
            }


            const outlineResponse = await axios.post(`${CONTENT_GENERATOR_API_LINK}/generate_outline`, {
                topic,
                num_of_terms: numOfTerms,
                num_of_keywords: numOfKeywords,
                user_custom_instructions: userCustomInstructions,
                num_of_points: numOfPoints,
            }, { 
                timeout: 600000,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
                }
            });

            const outline = outlineResponse.data?.outline;
            setSearchTerms(outlineResponse.data?.search_terms);
            console.log('Outline:', outline);

            if (!outline) {
                throw new Error("No outline generated. Please try again.");
            }

            setOutline(outline);
            setShowJSONEditor(true);
        } catch (error: any) {
            console.error('Error during content generation:', error);
            if (error.response) {
                toast.error(`Error: ${error.response.data.error || "Server error"}`);
            } else if (error.request) {
                toast.error('No response from server. Please try again later.');
            } else {
                toast.error(`Error: ${error.message}`);
            }
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
            }, { timeout: 600000 });

            const generatedContent = contentResponse.data?.content;
            console.log('Generated Content:', generatedContent);

            if (!generatedContent) {
                throw new Error("No content generated. Please try again.");
            }

            setContent(generatedContent);

            const metadataResponse = await axios.post(`${CONTENT_GENERATOR_API_LINK}/generate_metadata`, {
                topic,
                content: generatedContent,
                old_tags: oldTags.map(tag => tag.value),
                old_categories: oldCategories.map(category => category.value),
            }, { timeout: 600000 });

            const { title: generatedTitle = '', excerpt = '', tags = [], main_category = '' } = metadataResponse.data;

            setTitle(generatedTitle);
            setExcerpt(excerpt);
            setTags(tags.map((tag: any) => ({ label: tag, value: tag })));
            setCategory(main_category ? { label: main_category, value: main_category } : null);
            setFeaturedImage('/blogs/placeholder.jpg');
        } catch (error: any) {
            console.error('Error during content generation:', error);
            if (error.response) {
                toast.error(`Error: ${error.response.data.error || "Server error"}`);
            } else if (error.request) {
                toast.error('No response from server. Please try again later.');
            } else {
                toast.error(`Error: ${error.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Create New Post</h1>
            <div className="mb-4">
                <label className="block text-l font-bold text-gray dark:text-lightgray my-4">Topic</label>
                <input
                    type="text"
                    className="w-full text-gray dark:text-lightgray bg-white dark:bg-dark p-2 border border-gray-300 rounded"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                />
            </div>

            <div className="mb-4">
                <button
                    className="text-blue-500 underline"
                    onClick={() => setShowOutlineSettings(!showOutlineSettings)}
                >
                    {showOutlineSettings ? 'Hide' : 'Show'} Outline Advanced Settings
                </button>
                {showOutlineSettings && (
                    <div className="p-4 border border-gray-300 rounded bg-light dark:bg-gray">
                        <div className="flex space-x-4 mb-4">
                            <div className="flex-1">
                                <label className="block text-l font-bold text-gray dark:text-lightgray my-4">Number of Terms</label>
                                <input
                                    type="number"
                                    className="w-full text-gray dark:text-lightgray bg-white dark:bg-dark p-2 border border-gray-300 rounded"
                                    value={numOfTerms}
                                    onChange={(e) => setNumOfTerms(Number(e.target.value))}
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-l font-bold text-gray dark:text-lightgray my-4">Number of Keywords</label>
                                <input
                                    type="number"
                                    className="w-full text-gray dark:text-lightgray bg-white dark:bg-dark p-2 border border-gray-300 rounded"
                                    value={numOfKeywords}
                                    onChange={(e) => setNumOfKeywords(Number(e.target.value))}
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-l font-bold text-gray dark:text-lightgray my-4">Number of Points</label>
                                <input
                                    type="number"
                                    className="w-full text-gray dark:text-lightgray bg-white dark:bg-dark p-2 border border-gray-300 rounded"
                                    value={numOfPoints}
                                    onChange={(e) => setNumOfPoints(Number(e.target.value))}
                                />
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="block text-l font-bold text-gray dark:text-lightgray my-4">User Custom Instructions</label>
                            <textarea
                                className="w-full text-gray dark:text-lightgray bg-white dark:bg-dark p-2 border border-gray-300 rounded"
                                value={userCustomInstructions}
                                onChange={(e) => setUserCustomInstructions(e.target.value)}
                            />
                        </div>
                    </div>
                )}
            </div>

            <div className="mb-4">
                <button
                    className="text-blue-500 underline"
                    onClick={() => setShowContentSettings(!showContentSettings)}
                >
                    {showContentSettings ? 'Hide' : 'Show'} Content Generation Advanced Settings
                </button>
                {showContentSettings && (
                    <div className="p-4 border border-gray-300 rounded bg-light dark:bg-gray">
                        <div className="mb-4">
                            <label className="block text-l font-bold text-gray dark:text-lightgray my-4">User Custom Instructions</label>
                            <textarea
                                className="w-full text-gray dark:text-lightgray bg-white dark:bg-dark p-2 border border-gray-300 rounded"
                                value={userCustomInstructions}
                                onChange={(e) => setUserCustomInstructions(e.target.value)}
                            />
                        </div>
                    </div>
                )}
            </div>

            <div className="flex space-x-4 mb-4">
                <button
                    className="bg-blue-500 text-white font-bold p-2 rounded hover:bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-800"
                    onClick={handleGenerateOutline}
                    disabled={loading}
                >
                    {loading ? <ClipLoader size={20} color={"#fff"} /> : 'Generate Outline'}
                </button>

                <button
                    className="bg-yellow-500 text-white font-bold p-2 rounded hover:bg-yellow-600 dark:bg-yellow-700 dark:hover:bg-yellow-800"
                    onClick={() => setShowJSONEditor(true)}
                >
                    Edit Outline
                </button>
                {outline && (
                    <button
                        className="bg-green-500 text-white font-bold p-2 rounded hover:bg-green-600 dark:bg-green-700 dark:hover:bg-green-800"
                        onClick={handleAcceptOutline}
                        disabled={loading}
                    >
                        {loading ? <ClipLoader size={20} color={"#fff"} /> : 'Generate Content'}
                    </button>
                )}

                {/* View Logs Button */}
                <button
                    className="bg-slate-500 text-white font-bold p-2 rounded hover:bg-slate-600 dark:bg-slate-700 dark:hover:bg-slate-800"
                    onClick={() => setShowLogViewer(true)}
                >
                    View Logs
                </button>
                {showLogViewer && <LogViewer onClose={() => setShowLogViewer(false)} link='https://generate.api.devtrend.tech/logs' />}


                {/* check box to decide includeSearchTerms */}
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
            <div className="flex space-x-4">
                <button
                    className="bg-blue-500 text-white p-2 rounded"
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
        </div>
    );
};

export default withAdminAuth(CreatePost);