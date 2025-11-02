// Schema utilities for structured output
import { Type } from '@google/genai';

/**
 * Create a simple object schema
 * 
 * @param properties - Object properties
 * @param required - Required property names
 * @returns Type schema
 * 
 * @example
 * ```typescript
 * const schema = createObjectSchema({
 *   title: { type: Type.STRING, description: 'Post title' },
 *   tags: { type: Type.ARRAY, items: { type: Type.STRING } }
 * }, ['title']);
 * ```
 */
export function createObjectSchema(
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
 * Create an array schema
 * 
 * @param items - Schema for array items
 * @param description - Optional description
 * @returns Array schema
 * 
 * @example
 * ```typescript
 * const schema = createArraySchema(
 *   { type: Type.STRING },
 *   'List of tags'
 * );
 * ```
 */
export function createArraySchema(items: any, description?: string) {
    return {
        type: Type.ARRAY,
        items,
        ...(description ? { description } : {})
    };
}

/**
 * Create a string schema with constraints
 * 
 * @param options - String constraints
 * @returns String schema
 * 
 * @example
 * ```typescript
 * const schema = createStringSchema({
 *   description: 'Blog post title',
 *   minLength: 10,
 *   maxLength: 100,
 *   pattern: '^[A-Z].*'
 * });
 * ```
 */
export function createStringSchema(options?: {
    description?: string;
    enum?: string[];
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    format?: string;
}) {
    return {
        type: Type.STRING,
        ...options
    };
}

/**
 * Create a number schema with constraints
 * 
 * @param options - Number constraints
 * @returns Number schema
 * 
 * @example
 * ```typescript
 * const schema = createNumberSchema({
 *   description: 'Reading time in minutes',
 *   minimum: 1,
 *   maximum: 60
 * });
 * ```
 */
export function createNumberSchema(options?: {
    description?: string;
    minimum?: number;
    maximum?: number;
    multipleOf?: number;
}) {
    return {
        type: Type.NUMBER,
        ...options
    };
}

/**
 * Create a boolean schema
 * 
 * @param description - Optional description
 * @returns Boolean schema
 */
export function createBooleanSchema(description?: string) {
    return {
        type: Type.BOOLEAN,
        ...(description ? { description } : {})
    };
}

/**
 * Create an enum schema (string enum)
 * 
 * @param values - Allowed values
 * @param description - Optional description
 * @returns Enum schema
 * 
 * @example
 * ```typescript
 * const schema = createEnumSchema(
 *   ['draft', 'published', 'archived'],
 *   'Post status'
 * );
 * ```
 */
export function createEnumSchema(values: string[], description?: string) {
    return {
        type: Type.STRING,
        enum: values,
        ...(description ? { description } : {})
    };
}

/**
 * Common blog post schemas
 */
export const BlogSchemas = {
    /**
     * Blog post outline schema
     */
    outline: createObjectSchema({
        main_title: createStringSchema({
            description: 'Main title of the blog post'
        }),
        introduction: createStringSchema({
            description: 'Brief introduction paragraph'
        }),
        sections: createArraySchema({
            type: Type.OBJECT,
            properties: {
                title: createStringSchema({ description: 'Section title' }),
                description: createStringSchema({ description: 'Section description' }),
                points: createArraySchema(
                    { type: Type.STRING },
                    'Key points to cover'
                )
            },
            required: ['title', 'description']
        }),
        conclusion: createStringSchema({
            description: 'Concluding paragraph'
        }),
        search_terms: createArraySchema(
            { type: Type.STRING },
            'SEO keywords'
        )
    }, ['main_title', 'introduction', 'sections', 'conclusion']),

    /**
     * Blog post metadata schema
     */
    metadata: createObjectSchema({
        title: createStringSchema({
            description: 'SEO-optimized title (50-60 characters)',
            minLength: 40,
            maxLength: 65
        }),
        excerpt: createStringSchema({
            description: 'Meta description (120-160 characters)',
            minLength: 100,
            maxLength: 165
        }),
        tags: createArraySchema(
            { type: Type.STRING },
            'Post tags (5-7 tags)'
        ),
        main_category: createStringSchema({
            description: 'Primary category'
        })
    }, ['title', 'excerpt', 'tags', 'main_category']),

    /**
     * Blog post schema
     */
    post: createObjectSchema({
        title: createStringSchema({ description: 'Post title' }),
        slug: createStringSchema({ description: 'URL slug' }),
        excerpt: createStringSchema({ description: 'Brief excerpt' }),
        content: createStringSchema({ description: 'Full post content in markdown' }),
        featured_image: createStringSchema({ description: 'Featured image URL' }),
        tags: createArraySchema({ type: Type.STRING }, 'Post tags'),
        category: createStringSchema({ description: 'Post category' }),
        published_at: createStringSchema({ description: 'Publication date' }),
        author_id: createStringSchema({ description: 'Author ID' }),
        is_featured: createBooleanSchema('Is this a featured post?'),
        reading_time: createNumberSchema({
            description: 'Estimated reading time in minutes',
            minimum: 1
        })
    }, ['title', 'slug', 'content']),

    /**
     * Comment schema
     */
    comment: createObjectSchema({
        content: createStringSchema({ description: 'Comment text' }),
        author: createStringSchema({ description: 'Commenter name' }),
        email: createStringSchema({ description: 'Commenter email' }),
        post_id: createStringSchema({ description: 'Associated post ID' }),
        parent_id: createStringSchema({ description: 'Parent comment ID for replies' })
    }, ['content', 'author', 'post_id']),

    /**
     * Category schema
     */
    category: createObjectSchema({
        name: createStringSchema({ description: 'Category name' }),
        slug: createStringSchema({ description: 'URL slug' }),
        description: createStringSchema({ description: 'Category description' }),
        parent_id: createStringSchema({ description: 'Parent category ID' })
    }, ['name', 'slug']),

    /**
     * Tag schema
     */
    tag: createObjectSchema({
        name: createStringSchema({ description: 'Tag name' }),
        slug: createStringSchema({ description: 'URL slug' }),
        description: createStringSchema({ description: 'Tag description' })
    }, ['name', 'slug'])
};

/**
 * Merge multiple schemas into one
 * 
 * @param schemas - Array of object schemas to merge
 * @returns Merged schema
 * 
 * @example
 * ```typescript
 * const merged = mergeSchemas([
 *   createObjectSchema({ title: { type: Type.STRING } }),
 *   createObjectSchema({ author: { type: Type.STRING } })
 * ]);
 * ```
 */
export function mergeSchemas(...schemas: any[]) {
    const merged: any = {
        type: Type.OBJECT,
        properties: {},
        required: []
    };

    for (const schema of schemas) {
        if (schema.properties) {
            Object.assign(merged.properties, schema.properties);
        }
        if (schema.required) {
            merged.required.push(...schema.required);
        }
    }

    // Remove duplicate required fields
    merged.required = [...new Set(merged.required)];

    if (merged.required.length === 0) {
        delete merged.required;
    }

    return merged;
}

/**
 * Make all properties optional in a schema
 * 
 * @param schema - Object schema
 * @returns Schema with no required fields
 * 
 * @example
 * ```typescript
 * const optional = makeOptional(BlogSchemas.metadata);
 * ```
 */
export function makeOptional(schema: any) {
    const result = { ...schema };
    delete result.required;
    return result;
}

/**
 * Make specific properties required
 * 
 * @param schema - Object schema
 * @param required - Fields to make required
 * @returns Modified schema
 * 
 * @example
 * ```typescript
 * const schema = makeRequired(
 *   createObjectSchema({ title: {...}, author: {...} }),
 *   ['title']
 * );
 * ```
 */
export function makeRequired(schema: any, required: string[]) {
    return {
        ...schema,
        required
    };
}

/**
 * Pick specific properties from a schema
 * 
 * @param schema - Source schema
 * @param keys - Properties to pick
 * @returns New schema with only specified properties
 * 
 * @example
 * ```typescript
 * const minimal = pickProperties(BlogSchemas.post, ['title', 'excerpt']);
 * ```
 */
export function pickProperties(schema: any, keys: string[]) {
    if (!schema.properties) return schema;

    const properties: any = {};
    const required: string[] = [];

    for (const key of keys) {
        if (schema.properties[key]) {
            properties[key] = schema.properties[key];
            if (schema.required?.includes(key)) {
                required.push(key);
            }
        }
    }

    return {
        type: Type.OBJECT,
        properties,
        ...(required.length > 0 ? { required } : {})
    };
}

/**
 * Omit specific properties from a schema
 * 
 * @param schema - Source schema
 * @param keys - Properties to omit
 * @returns New schema without specified properties
 * 
 * @example
 * ```typescript
 * const noContent = omitProperties(BlogSchemas.post, ['content']);
 * ```
 */
export function omitProperties(schema: any, keys: string[]) {
    if (!schema.properties) return schema;

    const properties = { ...schema.properties };
    const required = [...(schema.required || [])];

    for (const key of keys) {
        delete properties[key];
        const reqIndex = required.indexOf(key);
        if (reqIndex > -1) {
            required.splice(reqIndex, 1);
        }
    }

    return {
        type: Type.OBJECT,
        properties,
        ...(required.length > 0 ? { required } : {})
    };
}

/**
 * Extend a schema with additional properties
 * 
 * @param baseSchema - Base schema to extend
 * @param extensions - Additional properties and requirements
 * @returns Extended schema
 * 
 * @example
 * ```typescript
 * const extended = extendSchema(BlogSchemas.post, {
 *   properties: {
 *     views: { type: Type.NUMBER }
 *   },
 *   required: ['views']
 * });
 * ```
 */
export function extendSchema(
    baseSchema: any,
    extensions: {
        properties?: Record<string, any>;
        required?: string[];
    }
) {
    return {
        ...baseSchema,
        properties: {
            ...baseSchema.properties,
            ...extensions.properties
        },
        required: [
            ...(baseSchema.required || []),
            ...(extensions.required || [])
        ]
    };
}

/**
 * Validate data against a schema (basic validation)
 * 
 * Note: This is a simple validator, actual validation is done by the AI model
 * 
 * @param data - Data to validate
 * @param schema - Schema to validate against
 * @returns Validation result
 * 
 * @example
 * ```typescript
 * const result = validateSchema(
 *   { title: 'Test', tags: ['ai'] },
 *   BlogSchemas.metadata
 * );
 * 
 * if (!result.valid) {
 *   console.error('Validation errors:', result.errors);
 * }
 * ```
 */
export function validateSchema(data: any, schema: any): {
    valid: boolean;
    errors: string[];
} {
    const errors: string[] = [];

    // Check required fields
    if (schema.required) {
        for (const field of schema.required) {
            if (!(field in data)) {
                errors.push(`Missing required field: ${field}`);
            }
        }
    }

    // Check types (basic)
    if (schema.properties) {
        for (const [key, propSchema] of Object.entries(schema.properties)) {
            if (key in data) {
                const value = data[key];
                const type = (propSchema as any).type;

                if (type === Type.STRING && typeof value !== 'string') {
                    errors.push(`Field ${key} must be a string`);
                } else if (type === Type.NUMBER && typeof value !== 'number') {
                    errors.push(`Field ${key} must be a number`);
                } else if (type === Type.BOOLEAN && typeof value !== 'boolean') {
                    errors.push(`Field ${key} must be a boolean`);
                } else if (type === Type.ARRAY && !Array.isArray(value)) {
                    errors.push(`Field ${key} must be an array`);
                } else if (type === Type.OBJECT && typeof value !== 'object') {
                    errors.push(`Field ${key} must be an object`);
                }
            }
        }
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Generate TypeScript interface from schema
 * 
 * @param schema - Schema to convert
 * @param interfaceName - Name for the interface
 * @returns TypeScript interface string
 * 
 * @example
 * ```typescript
 * const code = generateTypeScriptInterface(
 *   BlogSchemas.metadata,
 *   'PostMetadata'
 * );
 * console.log(code);
 * // interface PostMetadata {
 * //   title: string;
 * //   excerpt: string;
 * //   tags: string[];
 * //   main_category: string;
 * // }
 * ```
 */
export function generateTypeScriptInterface(
    schema: any,
    interfaceName: string
): string {
    if (schema.type !== Type.OBJECT || !schema.properties) {
        return `type ${interfaceName} = any;`;
    }

    const required = new Set(schema.required || []);
    const lines: string[] = [`export interface ${interfaceName} {`];

    for (const [key, propSchema] of Object.entries(schema.properties)) {
        const prop = propSchema as any;
        const optional = !required.has(key) ? '?' : '';
        let tsType = 'any';

        if (prop.type === Type.STRING) {
            tsType = 'string';
        } else if (prop.type === Type.NUMBER) {
            tsType = 'number';
        } else if (prop.type === Type.BOOLEAN) {
            tsType = 'boolean';
        } else if (prop.type === Type.ARRAY) {
            if (prop.items?.type === Type.STRING) {
                tsType = 'string[]';
            } else if (prop.items?.type === Type.NUMBER) {
                tsType = 'number[]';
            } else {
                tsType = 'any[]';
            }
        } else if (prop.type === Type.OBJECT) {
            tsType = 'object';
        }

        const comment = prop.description ? `  /** ${prop.description} */\n` : '';
        lines.push(`${comment}  ${key}${optional}: ${tsType};`);
    }

    lines.push('}');
    return lines.join('\n');
}
