// pages/create-post.tsx
import React, { useState } from 'react';
import axios from 'axios';
import { ClipLoader } from 'react-spinners';
import { ToastContainer, toast, Id } from 'react-toastify';
import { slug } from "github-slugger";
import 'react-toastify/dist/ReactToastify.css';
import { set } from 'date-fns';
import { useSession } from 'next-auth/react';

const CreatePost: React.FC = () => {
    const [title, setTitle] = useState('');
    const [excerpt, setExcerpt] = useState('');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState('');
    const [category, setCategory] = useState('');
    const [featuredImage, setFeaturedImage] = useState('');
    const [loading, setLoading] = useState(false);
    const { data: session, status } = useSession();
    
    const successToastId: Id = 'success-toast';
    const errorToastId: Id = 'error-toast';

    const genrate_postData = (isDraft = false) => {
        const postData = {
            title,
            slug: slug(title),
            excerpt,
            content,
            tags: {
                connectOrCreate: tags.split(',').map(tag => ({
                    where: {
                        slug: slug(tag.trim())
                    },
                    create: {
                        name: tag.trim(),
                        slug: slug(tag.trim())
                    }
                }))
            },
            category: {
                connectOrCreate: {
                    where: {
                        slug: slug(category)
                    },
                    create: {
                        name: category,
                        slug: slug(category)
                    }
                }
            },
            featured_image_url: featuredImage,
            status: isDraft ? 'draft' : 'published',
            author_id: session?.user?.id,
        };
        return postData;
    }

    const SavePost = async (postData = {}) => {
        try {
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
    }



    const handleSave = async () => {
        setLoading(true);
        const postData = genrate_postData();
        SavePost(postData);
    }

    const handleGenerateContent = async () => {
        setLoading(true);
        try {
            const topicResponse = await axios.post('http://localhost:5000/generate_topic_options', {
                search_term: title,
            }, { timeout: 300000 });

            const topic = topicResponse.data?.general_topics?.[0];
            console.log('Topic:', topic);

            if (!topic) {
                throw new Error("No topic generated. Please try again.");
            }

            const outlineResponse = await axios.post('http://localhost:5000/generate_outline', {
                topic,
                num_of_terms: 3,
                num_of_keywords: 20,
            }, { timeout: 300000 });

            const outline = outlineResponse.data?.outline;
            console.log('Outline:', outline);

            if (!outline) {
                throw new Error("No outline generated. Please try again.");
            }

            const contentResponse = await axios.post('http://localhost:5000/generate_content', {
                topic,
                outline,
                google_search_results: [],
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
            }, { timeout: 300000 });

            const { title: generatedTitle = '', excerpt = '', tags = [], main_category = '' } = metadataResponse.data;
            console.log('Generated Metadata:', metadataResponse.data);

            setTitle(generatedTitle);
            setExcerpt(excerpt);
            setTags(tags.join(', '));
            setCategory(main_category);
            setFeaturedImage('/blogs/placeholder.jpg');

            const postData = genrate_postData(true);
            SavePost(postData);
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
                <label className="block text-gray-700">Title</label>
                <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
            </div>
            <div className="mb-4">
                <label className="block text-gray-700">Excerpt</label>
                <textarea
                    className="w-full p-2 border border-gray-300 rounded"
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                />
            </div>
            <div className="mb-4">
                <label className="block text-gray-700">Content</label>
                <textarea
                    className="w-full p-2 border border-gray-300 rounded"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                />
            </div>
            <div className="mb-4">
                <label className="block text-gray-700">Tags (comma separated)</label>
                <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                />
            </div>
            <div className="mb-4">
                <label className="block text-gray-700">Category</label>
                <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                />
            </div>
            <div className="mb-4">
                <label className="block text-gray-700">Featured Image URL</label>
                <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded"
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