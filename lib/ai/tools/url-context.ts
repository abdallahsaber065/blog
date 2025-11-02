// URL context tool for grounding on specific URLs

/**
 * Create URL context tool configuration
 * 
 * Allows the model to access and reference content from specific URLs
 * 
 * @param urls - Array of URLs to provide as context
 * @param maxCharsPerUrl - Maximum characters to extract per URL
 * @returns Tool configuration object for URL context
 * 
 * @example
 * ```typescript
 * const tools = [createURLContextTool([
 *   'https://example.com/article',
 *   'https://example.com/documentation'
 * ])];
 * 
 * const result = await model.generateContent({
 *   contents: 'Summarize the key points from these articles',
 *   tools
 * });
 * ```
 */
export function createURLContextTool(urls: string[], maxCharsPerUrl?: number) {
    return {
        retrieval: {
            dynamicRetrievalConfig: {
                mode: 'MODE_DYNAMIC',
                dynamicThreshold: 0.3
            },
            urlContext: {
                urls: urls.map(url => ({ url })),
                ...(maxCharsPerUrl && { maxCharsPerUrl })
            }
        }
    };
}

/**
 * Create simple URL grounding (without full retrieval)
 * 
 * @param urls - Array of URLs to ground on
 * @returns Simplified URL context configuration
 * 
 * @example
 * ```typescript
 * const tools = [createSimpleURLGrounding([
 *   'https://example.com/docs'
 * ])];
 * ```
 */
export function createSimpleURLGrounding(urls: string[]) {
    return {
        retrieval: {
            urlContext: {
                urls: urls.map(url => ({ url }))
            }
        }
    };
}

/**
 * Validate URLs before sending to API
 * 
 * @param urls - Array of URLs to validate
 * @returns Object with valid URLs and invalid URLs with reasons
 * 
 * @example
 * ```typescript
 * const { valid, invalid } = validateURLs([
 *   'https://example.com',
 *   'not-a-url',
 *   'ftp://invalid-protocol.com'
 * ]);
 * ```
 */
export function validateURLs(urls: string[]): {
    valid: string[];
    invalid: Array<{ url: string; reason: string }>;
} {
    const valid: string[] = [];
    const invalid: Array<{ url: string; reason: string }> = [];

    for (const url of urls) {
        try {
            const parsed = new URL(url);

            // Check for http/https protocol
            if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
                invalid.push({
                    url,
                    reason: 'Only HTTP and HTTPS protocols are supported'
                });
                continue;
            }

            valid.push(url);
        } catch (error) {
            invalid.push({
                url,
                reason: 'Invalid URL format'
            });
        }
    }

    return { valid, invalid };
}

/**
 * Check if response used URL context
 * 
 * @param response - The model response
 * @returns True if URL context was used
 */
export function hasURLContext(response: any): boolean {
    // Check if grounding metadata includes URL sources
    if (!response.groundingMetadata?.groundingChunks) {
        return false;
    }

    for (const chunk of response.groundingMetadata.groundingChunks) {
        if (chunk.web?.uri) {
            return true;
        }
    }

    return false;
}

/**
 * Extract URLs that were actually used from response
 * 
 * @param response - The model response
 * @param providedURLs - The URLs that were provided in the context
 * @returns Array of URLs that were referenced
 * 
 * @example
 * ```typescript
 * const usedURLs = extractUsedURLs(response, [
 *   'https://example.com/1',
 *   'https://example.com/2'
 * ]);
 * console.log('Model used:', usedURLs);
 * ```
 */
export function extractUsedURLs(response: any, providedURLs: string[]): string[] {
    if (!response.groundingMetadata?.groundingChunks) {
        return [];
    }

    const usedURLs = new Set<string>();

    for (const chunk of response.groundingMetadata.groundingChunks) {
        if (chunk.web?.uri) {
            // Check if this URL matches one of our provided URLs
            const matchedURL = providedURLs.find(url =>
                chunk.web.uri.includes(url) || url.includes(chunk.web.uri)
            );

            if (matchedURL) {
                usedURLs.add(matchedURL);
            }
        }
    }

    return Array.from(usedURLs);
}

/**
 * Create URL context summary for logging
 * 
 * @param response - The model response
 * @param providedURLs - The URLs that were provided
 * @returns Summary object with URL usage statistics
 */
export function createURLContextSummary(response: any, providedURLs: string[]) {
    const hasContext = hasURLContext(response);
    const usedURLs = extractUsedURLs(response, providedURLs);
    const unusedURLs = providedURLs.filter(url => !usedURLs.includes(url));

    return {
        hasURLContext: hasContext,
        providedCount: providedURLs.length,
        usedCount: usedURLs.length,
        unusedCount: unusedURLs.length,
        usedURLs,
        unusedURLs
    };
}

/**
 * Sanitize URLs for safe usage
 * 
 * @param urls - Array of URLs to sanitize
 * @returns Array of sanitized URLs
 */
export function sanitizeURLs(urls: string[]): string[] {
    return urls.map(url => {
        try {
            const parsed = new URL(url);
            // Remove fragments and normalize
            parsed.hash = '';
            return parsed.toString();
        } catch {
            return url; // Return as-is if invalid
        }
    });
}

/**
 * Check if URLs are accessible (basic check)
 * 
 * Note: This makes actual HTTP requests, use sparingly
 * 
 * @param urls - Array of URLs to check
 * @param timeout - Request timeout in milliseconds
 * @returns Map of URLs to accessibility status
 * 
 * @example
 * ```typescript
 * const accessibility = await checkURLAccessibility([
 *   'https://example.com'
 * ]);
 * 
 * if (!accessibility['https://example.com']) {
 *   console.warn('URL is not accessible');
 * }
 * ```
 */
export async function checkURLAccessibility(
    urls: string[],
    timeout: number = 5000
): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};

    await Promise.all(
        urls.map(async (url) => {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), timeout);

                const response = await fetch(url, {
                    method: 'HEAD',
                    signal: controller.signal
                });

                clearTimeout(timeoutId);
                results[url] = response.ok;
            } catch {
                results[url] = false;
            }
        })
    );

    return results;
}

/**
 * Create URL context with validation and error handling
 * 
 * @param urls - Array of URLs to use
 * @param options - Configuration options
 * @returns Tool configuration or error object
 * 
 * @example
 * ```typescript
 * const result = createValidatedURLContext([
 *   'https://example.com'
 * ], {
 *   maxCharsPerUrl: 10000,
 *   validateBeforeUse: true
 * });
 * 
 * if (result.error) {
 *   console.error('Invalid URLs:', result.invalidURLs);
 * } else {
 *   // Use result.tool
 * }
 * ```
 */
export function createValidatedURLContext(
    urls: string[],
    options?: {
        maxCharsPerUrl?: number;
        validateBeforeUse?: boolean;
    }
): { tool?: any; error?: string; invalidURLs?: any[] } {
    if (urls.length === 0) {
        return { error: 'No URLs provided' };
    }

    // Sanitize URLs
    const sanitized = sanitizeURLs(urls);

    // Validate if requested
    if (options?.validateBeforeUse) {
        const { valid, invalid } = validateURLs(sanitized);

        if (invalid.length > 0) {
            return {
                error: 'Some URLs are invalid',
                invalidURLs: invalid
            };
        }

        return {
            tool: createURLContextTool(valid, options.maxCharsPerUrl)
        };
    }

    return {
        tool: createURLContextTool(sanitized, options?.maxCharsPerUrl)
    };
}
