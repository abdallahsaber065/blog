import React, { useState, useEffect } from 'react';
import axios from 'axios';
import readingTime from "reading-time";
import { ClipLoader } from 'react-spinners';
import { ToastContainer, toast, Id } from 'react-toastify';
import { slug } from "github-slugger";
import 'react-toastify/dist/ReactToastify.css';
import { useSession } from 'next-auth/react';
import EditorWithPreview from '@/components/admin/EditorWithPreview';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';

const animatedComponents = makeAnimated();

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

    const [numOfTerms, setNumOfTerms] = useState(3);
    const [numOfKeywords, setNumOfKeywords] = useState(20);
    const [userCustomInstructions, setUserCustomInstructions] = useState('');
    const [numOfPoints, setNumOfPoints] = useState(5);

    const successToastId: Id = 'success-toast';
    const errorToastId: Id = 'error-toast';

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
                        if (!toast.isActive(errorToastId)) {
                            toast.error('Title is not unique. Changing slug to make it unique.', { toastId: errorToastId });
                        }
                    }
                } catch (error) {
                    console.error('Error checking slug uniqueness:', error);
                    throw new Error('Failed to check slug uniqueness.');
                }
            }
    
            postData.slug = uniqueSlug;
    
            const response = await axios.post('/api/posts', postData);
            console.log("API Response:", response.data);
    
            if (!toast.isActive(successToastId)) {
                toast.success('Post created successfully!', { toastId: successToastId });
            }
        } catch (error: any) {
            console.error('Failed to create post:', error);
    
            if (error.response) {
                if (!toast.isActive(errorToastId)) {
                    toast.error(`Error: ${error.response.data.error || "Server error"}`, { toastId: errorToastId });
                }
            } else if (error.request) {
                if (!toast.isActive(errorToastId)) {
                    toast.error('No response from server. Please try again later.', { toastId: errorToastId });
                }
            } else {
                if (!toast.isActive(errorToastId)) {
                    toast.error(`Error: ${error.message}`, { toastId: errorToastId });
                }
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        const postData = genrate_postData();
        SavePost(postData);
    };

    const handleGenerateContent = async () => {
        setLoading(true);
        try {
            if (!topic) {
                throw new Error("Please enter a topic to generate content.");
            }

            const outlineResponse = await axios.post('http://localhost:5000/generate_outline', {
                topic,
                num_of_terms: numOfTerms,
                num_of_keywords: numOfKeywords,
                user_custom_instructions: userCustomInstructions,
                num_of_points: numOfPoints,
            }, { timeout: 300000 });

            const outline = outlineResponse.data?.outline;
            const search_terms = outlineResponse.data?.search_terms;
            console.log('Outline:', outline);

            if (!outline) {
                throw new Error("No outline generated. Please try again.");
            }

            const contentResponse = await axios.post('http://localhost:5000/generate_content', {
                topic,
                outline,
                search_terms,
                user_custom_instructions: userCustomInstructions,
            }, { timeout: 300000 });

            const generatedContent = contentResponse.data?.content;
            console.log('Generated Content:', generatedContent);

            if (!generatedContent) {
                throw new Error("No content generated. Please try again.");
            }

            setContent(generatedContent);

            const metadataResponse = await axios.post('http://localhost:5000/generate_metadata', {
                topic,
                content: generatedContent,
                old_tags: oldTags.map(tag => tag.value),
                old_categories: oldCategories.map(category => category.value),
            }, { timeout: 300000 });

            const { title: generatedTitle = '', excerpt = '', tags = [], main_category = '' } = metadataResponse.data;

            setTitle(generatedTitle);
            setExcerpt(excerpt);
            setTags(tags.map((tag: any) => ({ label: tag, value: tag })));
            setCategory(main_category ? { label: main_category, value: main_category } : null);
            setFeaturedImage('/blogs/placeholder.jpg');
        } catch (error: any) {
            console.error('Error during content generation:', error);
            if (error.response) {
                if (!toast.isActive(errorToastId)) {
                    toast.error(`Error: ${error.response.data.error || "Server error"}`, { toastId: errorToastId });
                }
            } else if (error.request) {
                if (!toast.isActive(errorToastId)) {
                    toast.error('No response from server. Please try again later.', { toastId: errorToastId });
                }
            } else {
                if (!toast.isActive(errorToastId)) {
                    toast.error(`Error: ${error.message}`, { toastId: errorToastId });
                }
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
                <button
                    className="bg-green-500 text-white p-2 rounded"
                    onClick={handleGenerateContent}
                    disabled={loading}
                >
                    {loading ? <ClipLoader size={20} color={"#fff"} /> : 'Generate Content'}
                </button>
            </div>
            <ToastContainer />
        </div>
    );
};

export default CreatePost;