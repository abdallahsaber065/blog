// Function calling (tools) implementation
import { Type } from '@google/genai';
import { FunctionCall, FunctionDeclaration, FunctionResponse } from '../types';

/**
 * Create a function declaration for tool use
 * 
 * @param name - Function name
 * @param description - What the function does
 * @param parameters - JSON schema for parameters
 * @returns Function declaration object
 * 
 * @example
 * ```typescript
 * const searchFunction = createFunctionDeclaration(
 *   'search_database',
 *   'Search the blog database for posts',
 *   {
 *     type: Type.OBJECT,
 *     properties: {
 *       query: { type: Type.STRING, description: 'Search query' },
 *       limit: { type: Type.NUMBER, description: 'Max results' }
 *     },
 *     required: ['query']
 *   }
 * );
 * ```
 */
export function createFunctionDeclaration(
    name: string,
    description: string,
    parameters: any
): FunctionDeclaration {
    return {
        name,
        description,
        parameters: {
            type: Type.OBJECT,
            ...parameters
        }
    };
}

/**
 * Create a tool config with multiple function declarations
 * 
 * @param functions - Array of function declarations
 * @returns Tool configuration object
 * 
 * @example
 * ```typescript
 * const tools = createFunctionCallingTool([
 *   searchFunction,
 *   updateFunction,
 *   deleteFunction
 * ]);
 * 
 * const result = await model.generateContent({
 *   contents: 'Find recent posts about AI',
 *   tools
 * });
 * ```
 */
export function createFunctionCallingTool(functions: FunctionDeclaration[]) {
    return {
        functionDeclarations: functions
    };
}

/**
 * Parse function calls from model response
 * 
 * @param response - The model response
 * @returns Array of function calls to execute
 * 
 * @example
 * ```typescript
 * const calls = parseFunctionCalls(response);
 * for (const call of calls) {
 *   const result = await executeTool(call.name, call.args);
 *   // Send result back to model
 * }
 * ```
 */
export function parseFunctionCalls(response: any): FunctionCall[] {
    const calls: FunctionCall[] = [];

    if (!response.candidates) {
        return calls;
    }

    for (const candidate of response.candidates) {
        if (!candidate.content?.parts) continue;

        for (const part of candidate.content.parts) {
            if (part.functionCall) {
                calls.push({
                    name: part.functionCall.name,
                    args: part.functionCall.args || {}
                });
            }
        }
    }

    return calls;
}

/**
 * Create function response part for next model turn
 * 
 * @param functionCall - The original function call
 * @param result - The result from executing the function
 * @returns Function response object to send back to model
 * 
 * @example
 * ```typescript
 * const calls = parseFunctionCalls(response);
 * const responses = [];
 * 
 * for (const call of calls) {
 *   const result = await executeTool(call.name, call.args);
 *   responses.push(createFunctionResponse(call, result));
 * }
 * 
 * // Continue conversation with function responses
 * const nextResponse = await model.generateContent({
 *   contents: [
 *     ...history,
 *     { role: 'model', parts: response.candidates[0].content.parts },
 *     { role: 'function', parts: responses }
 *   ]
 * });
 * ```
 */
export function createFunctionResponse(
    functionCall: FunctionCall,
    result: any
): FunctionResponse {
    return {
        name: functionCall.name,
        response: result
    };
}

/**
 * Check if response contains function calls
 * 
 * @param response - The model response
 * @returns True if model wants to call functions
 */
export function hasFunctionCalls(response: any): boolean {
    if (!response.candidates) return false;

    for (const candidate of response.candidates) {
        if (!candidate.content?.parts) continue;

        for (const part of candidate.content.parts) {
            if (part.functionCall) {
                return true;
            }
        }
    }

    return false;
}

/**
 * Helper to build parameter schemas using Type enum
 * 
 * @example
 * ```typescript
 * const schema = buildParameterSchema({
 *   query: { type: Type.STRING, description: 'Search query' },
 *   limit: { type: Type.NUMBER, description: 'Max results', default: 10 },
 *   tags: { type: Type.ARRAY, items: { type: Type.STRING } }
 * }, ['query']);
 * ```
 */
export function buildParameterSchema(
    properties: Record<string, any>,
    required?: string[]
) {
    return {
        type: Type.OBJECT,
        properties,
        ...(required && required.length > 0 ? { required } : {})
    };
}

/**
 * Common blog-specific function declarations
 */
export const BlogFunctionDeclarations = {
    /**
     * Search blog posts
     */
    searchPosts: createFunctionDeclaration(
        'search_posts',
        'Search published blog posts by query, tags, or categories',
        buildParameterSchema({
            query: {
                type: Type.STRING,
                description: 'Search query to match against post titles and content'
            },
            tags: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Filter by tags'
            },
            category: {
                type: Type.STRING,
                description: 'Filter by category'
            },
            limit: {
                type: Type.NUMBER,
                description: 'Maximum number of results',
                default: 10
            }
        }, ['query'])
    ),

    /**
     * Get post by slug
     */
    getPost: createFunctionDeclaration(
        'get_post',
        'Retrieve full details of a blog post by its slug',
        buildParameterSchema({
            slug: {
                type: Type.STRING,
                description: 'The URL slug of the blog post'
            }
        }, ['slug'])
    ),

    /**
     * List categories
     */
    listCategories: createFunctionDeclaration(
        'list_categories',
        'Get all available blog post categories',
        buildParameterSchema({})
    ),

    /**
     * List tags
     */
    listTags: createFunctionDeclaration(
        'list_tags',
        'Get all available blog post tags',
        buildParameterSchema({
            limit: {
                type: Type.NUMBER,
                description: 'Maximum number of tags to return'
            }
        })
    ),

    /**
     * Get related posts
     */
    getRelatedPosts: createFunctionDeclaration(
        'get_related_posts',
        'Find blog posts related to a given post based on tags and categories',
        buildParameterSchema({
            slug: {
                type: Type.STRING,
                description: 'The slug of the reference post'
            },
            limit: {
                type: Type.NUMBER,
                description: 'Maximum number of related posts',
                default: 5
            }
        }, ['slug'])
    )
};

/**
 * Execute function call with error handling
 * 
 * @param functionCall - The function call from the model
 * @param handlers - Map of function names to handler functions
 * @returns Function response or error
 * 
 * @example
 * ```typescript
 * const handlers = {
 *   search_posts: async (args) => {
 *     return await db.post.findMany({
 *       where: { title: { contains: args.query } }
 *     });
 *   }
 * };
 * 
 * const calls = parseFunctionCalls(response);
 * const responses = await Promise.all(
 *   calls.map(call => executeFunctionCall(call, handlers))
 * );
 * ```
 */
export async function executeFunctionCall(
    functionCall: FunctionCall,
    handlers: Record<string, (args: any) => Promise<any>>
): Promise<FunctionResponse> {
    try {
        const handler = handlers[functionCall.name];

        if (!handler) {
            return createFunctionResponse(functionCall, {
                error: `Function ${functionCall.name} not found`
            });
        }

        const result = await handler(functionCall.args);
        return createFunctionResponse(functionCall, result);

    } catch (error: any) {
        return createFunctionResponse(functionCall, {
            error: error.message || 'Function execution failed'
        });
    }
}

/**
 * Create a multi-turn conversation handler with function calling
 * 
 * @param model - The AI model instance
 * @param functions - Array of function declarations
 * @param handlers - Map of function handlers
 * @returns Chat function with automatic tool execution
 * 
 * @example
 * ```typescript
 * const chat = createFunctionCallingChat(
 *   model,
 *   [BlogFunctionDeclarations.searchPosts],
 *   {
 *     search_posts: async (args) => await searchDatabase(args)
 *   }
 * );
 * 
 * const response = await chat('Find posts about Next.js');
 * console.log(response.text);
 * ```
 */
export function createFunctionCallingChat(
    model: any,
    functions: FunctionDeclaration[],
    handlers: Record<string, (args: any) => Promise<any>>
) {
    const tools = [createFunctionCallingTool(functions)];
    const history: any[] = [];

    return async function chat(userMessage: string, maxTurns: number = 5) {
        // Add user message
        history.push({
            role: 'user',
            parts: [{ text: userMessage }]
        });

        let turnCount = 0;
        let lastResponse: any;

        while (turnCount < maxTurns) {
            // Generate content with tools
            const response = await model.generateContent({
                contents: history,
                tools
            });

            lastResponse = response;

            // Check for function calls
            const functionCalls = parseFunctionCalls(response);

            if (functionCalls.length === 0) {
                // No more function calls, return final response
                break;
            }

            // Add model's function call to history
            history.push({
                role: 'model',
                parts: response.candidates[0].content.parts
            });

            // Execute all function calls
            const functionResponses = await Promise.all(
                functionCalls.map(call => executeFunctionCall(call, handlers))
            );

            // Add function responses to history
            history.push({
                role: 'function',
                parts: functionResponses.map(fr => ({
                    functionResponse: {
                        name: fr.name,
                        response: fr.response
                    }
                }))
            });

            turnCount++;
        }

        return {
            text: lastResponse?.candidates?.[0]?.content?.parts?.[0]?.text || '',
            history,
            functionCallsMade: turnCount
        };
    };
}
