// Comprehensive chatbot tools for blog interaction
import { Type } from '@google/genai';
import { buildParameterSchema, createFunctionDeclaration } from './function-calling';

/**
 * All available chatbot tools for blog management
 */
export const ChatbotTools = {
    /**
     * Search blog posts
     */
    searchPosts: createFunctionDeclaration(
        'search_posts',
        'Search published blog posts by query, tags, or categories. Returns matching posts with their content.',
        buildParameterSchema({
            query: {
                type: Type.STRING,
                description: 'Search query to find posts'
            },
            tags: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Filter by specific tags'
            },
            limit: {
                type: Type.NUMBER,
                description: 'Maximum number of results (default: 10)'
            }
        }, ['query'])
    ),

    /**
     * Get post by ID or slug
     */
    getPost: createFunctionDeclaration(
        'get_post',
        'Retrieve a specific blog post by ID or slug. Returns full post content including metadata.',
        buildParameterSchema({
            identifier: {
                type: Type.STRING,
                description: 'Post ID or slug'
            }
        }, ['identifier'])
    ),

    /**
     * List all categories
     */
    getCategories: createFunctionDeclaration(
        'get_categories',
        'Get all available blog categories with post counts',
        buildParameterSchema({})
    ),

    /**
     * List all tags
     */
    getTags: createFunctionDeclaration(
        'get_tags',
        'Get all available blog tags with usage counts',
        buildParameterSchema({})
    ),

    /**
     * Get posts by category
     */
    getPostsByCategory: createFunctionDeclaration(
        'get_posts_by_category',
        'Get all posts in a specific category',
        buildParameterSchema({
            categoryId: {
                type: Type.STRING,
                description: 'Category ID or slug'
            },
            limit: {
                type: Type.NUMBER,
                description: 'Maximum number of results'
            }
        }, ['categoryId'])
    ),

    /**
     * Get posts by tag
     */
    getPostsByTag: createFunctionDeclaration(
        'get_posts_by_tag',
        'Get all posts with a specific tag',
        buildParameterSchema({
            tag: {
                type: Type.STRING,
                description: 'Tag name'
            },
            limit: {
                type: Type.NUMBER,
                description: 'Maximum number of results'
            }
        }, ['tag'])
    ),

    /**
     * Get post statistics
     */
    getPostStats: createFunctionDeclaration(
        'get_post_stats',
        'Get statistics about blog posts (total count, published, drafts, categories, tags)',
        buildParameterSchema({})
    ),

    /**
     * Generate content outline
     */
    generateOutline: createFunctionDeclaration(
        'generate_outline',
        'Generate a structured outline for a blog post on a given topic',
        buildParameterSchema({
            topic: {
                type: Type.STRING,
                description: 'Blog post topic'
            },
            num_of_keywords: {
                type: Type.NUMBER,
                description: 'Number of SEO keywords to generate (default: 20)'
            },
            user_custom_instructions: {
                type: Type.STRING,
                description: 'Additional instructions for content generation'
            }
        }, ['topic'])
    ),

    /**
     * Get recent posts
     */
    getRecentPosts: createFunctionDeclaration(
        'get_recent_posts',
        'Get the most recently published blog posts',
        buildParameterSchema({
            limit: {
                type: Type.NUMBER,
                description: 'Number of posts to retrieve (default: 5)'
            }
        })
    ),

    /**
     * Get featured posts
     */
    getFeaturedPosts: createFunctionDeclaration(
        'get_featured_posts',
        'Get featured or highlighted blog posts',
        buildParameterSchema({
            limit: {
                type: Type.NUMBER,
                description: 'Number of posts to retrieve'
            }
        })
    ),

    /**
     * Search users (admin only)
     */
    searchUsers: createFunctionDeclaration(
        'search_users',
        'Search for users by name or email (requires admin permissions)',
        buildParameterSchema({
            query: {
                type: Type.STRING,
                description: 'Search query for user name or email'
            }
        }, ['query'])
    ),

    /**
     * Get post permissions
     */
    getPostPermissions: createFunctionDeclaration(
        'get_post_permissions',
        'Check user permissions for a specific post',
        buildParameterSchema({
            postId: {
                type: Type.STRING,
                description: 'Post ID'
            }
        }, ['postId'])
    ),

    /**
     * Generate post metadata
     */
    generateMetadata: createFunctionDeclaration(
        'generate_metadata',
        'Generate SEO metadata (title, description, keywords) for content',
        buildParameterSchema({
            content: {
                type: Type.STRING,
                description: 'Blog post content'
            },
            title: {
                type: Type.STRING,
                description: 'Post title'
            }
        }, ['content'])
    ),

    /**
     * Get website information
     */
    getSiteInfo: createFunctionDeclaration(
        'get_site_info',
        'Get general information about the blog website (name, description, features)',
        buildParameterSchema({})
    ),

    /**
     * Analyze content
     */
    analyzeContent: createFunctionDeclaration(
        'analyze_content',
        'Analyze blog post content for readability, SEO, and quality metrics',
        buildParameterSchema({
            content: {
                type: Type.STRING,
                description: 'Content to analyze'
            }
        }, ['content'])
    ),

    /**
     * Get related posts
     */
    getRelatedPosts: createFunctionDeclaration(
        'get_related_posts',
        'Find posts related to a given post based on tags and categories',
        buildParameterSchema({
            postId: {
                type: Type.STRING,
                description: 'Post ID to find related posts for'
            },
            limit: {
                type: Type.NUMBER,
                description: 'Maximum number of related posts'
            }
        }, ['postId'])
    ),

    /**
     * Upload file information
     */
    getUploadedFiles: createFunctionDeclaration(
        'get_uploaded_files',
        'Get list of uploaded files and media',
        buildParameterSchema({
            type: {
                type: Type.STRING,
                description: 'File type filter: "image", "document", "all"'
            }
        })
    ),
};

/**
 * Tool executor - maps tool calls to actual API endpoints
 */
export async function executeChatbotTool(
    toolName: string,
    args: any,
    sessionToken?: string
): Promise<any> {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };

    if (sessionToken) {
        headers['Authorization'] = `Bearer ${sessionToken}`;
    }

    try {
        switch (toolName) {
            case 'search_posts':
                const searchParams = new URLSearchParams({
                    query: args.query,
                    ...(args.tags && { tags: args.tags.join(',') }),
                    ...(args.limit && { limit: args.limit.toString() })
                });
                const searchRes = await fetch(`${baseUrl}/api/search?${searchParams}`);
                return await searchRes.json();

            case 'get_post':
                const postRes = await fetch(`${baseUrl}/api/posts/${args.identifier}`);
                return await postRes.json();

            case 'get_categories':
                const categoriesRes = await fetch(`${baseUrl}/api/categories`, { headers });
                return await categoriesRes.json();

            case 'get_tags':
                const tagsRes = await fetch(`${baseUrl}/api/tags`, { headers });
                return await tagsRes.json();

            case 'get_posts_by_category':
                const categoryPostsParams = new URLSearchParams({
                    category: args.categoryId,
                    ...(args.limit && { limit: args.limit.toString() })
                });
                const categoryPostsRes = await fetch(`${baseUrl}/api/posts?${categoryPostsParams}`);
                return await categoryPostsRes.json();

            case 'get_posts_by_tag':
                const tagPostsParams = new URLSearchParams({
                    tag: args.tag,
                    ...(args.limit && { limit: args.limit.toString() })
                });
                const tagPostsRes = await fetch(`${baseUrl}/api/posts?${tagPostsParams}`);
                return await tagPostsRes.json();

            case 'get_post_stats':
                const [postsRes, catsRes, tagsStatsRes] = await Promise.all([
                    fetch(`${baseUrl}/api/posts`, { headers }),
                    fetch(`${baseUrl}/api/categories`, { headers }),
                    fetch(`${baseUrl}/api/tags`, { headers })
                ]);

                const posts = await postsRes.json();
                const categories = await catsRes.json();
                const tags = await tagsStatsRes.json();

                return {
                    totalPosts: posts.length || 0,
                    totalCategories: categories.length || 0,
                    totalTags: tags.length || 0,
                    posts: posts
                };

            case 'generate_outline':
                const outlineRes = await fetch(`${baseUrl}/api/ai/generate-outline`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        topic: args.topic,
                        num_of_keywords: args.num_of_keywords || 20,
                        user_custom_instructions: args.user_custom_instructions || ''
                    })
                });
                return await outlineRes.json();

            case 'get_recent_posts':
                const recentParams = new URLSearchParams({
                    limit: (args.limit || 5).toString(),
                    sort: 'recent'
                });
                const recentRes = await fetch(`${baseUrl}/api/posts?${recentParams}`);
                return await recentRes.json();

            case 'get_featured_posts':
                const featuredParams = new URLSearchParams({
                    featured: 'true',
                    ...(args.limit && { limit: args.limit.toString() })
                });
                const featuredRes = await fetch(`${baseUrl}/api/posts?${featuredParams}`);
                return await featuredRes.json();

            case 'search_users':
                const usersParams = new URLSearchParams({ query: args.query });
                const usersRes = await fetch(`${baseUrl}/api/users?${usersParams}`, { headers });
                return await usersRes.json();

            case 'get_post_permissions':
                const permRes = await fetch(`${baseUrl}/api/posts/${args.postId}/permissions`, { headers });
                return await permRes.json();

            case 'generate_metadata':
                const metaRes = await fetch(`${baseUrl}/api/ai/generate-metadata`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        content: args.content,
                        title: args.title
                    })
                });
                return await metaRes.json();

            case 'get_site_info':
                return {
                    name: 'Blog Platform',
                    description: 'A modern blog platform with AI-powered content generation',
                    features: [
                        'AI Content Generation',
                        'Rich Text Editor',
                        'SEO Optimization',
                        'Category & Tag Management',
                        'User Management',
                        'Media Library'
                    ],
                    version: '1.0.0'
                };

            case 'analyze_content':
                // Simple content analysis
                const wordCount = args.content.split(/\s+/).length;
                const charCount = args.content.length;
                const paragraphs = args.content.split(/\n\n+/).length;

                return {
                    wordCount,
                    charCount,
                    paragraphs,
                    readingTime: Math.ceil(wordCount / 200), // minutes
                    quality: wordCount > 300 ? 'Good' : 'Needs more content'
                };

            case 'get_related_posts':
                const relatedParams = new URLSearchParams({
                    related: args.postId,
                    ...(args.limit && { limit: args.limit.toString() })
                });
                const relatedRes = await fetch(`${baseUrl}/api/posts?${relatedParams}`);
                return await relatedRes.json();

            case 'get_uploaded_files':
                const filesEndpoint = args.type === 'image' ? '/api/media' : '/api/files';
                const filesRes = await fetch(`${baseUrl}${filesEndpoint}`, { headers });
                return await filesRes.json();

            default:
                throw new Error(`Unknown tool: ${toolName}`);
        }
    } catch (error) {
        console.error(`Error executing tool ${toolName}:`, error);
        return {
            error: `Failed to execute ${toolName}`,
            details: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

/**
 * Get all chatbot tools as function calling config
 */
export function getChatbotToolsConfig() {
    return {
        functionDeclarations: Object.values(ChatbotTools)
    };
}
