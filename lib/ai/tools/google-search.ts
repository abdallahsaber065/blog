// Google Search grounding tool
import { GroundingSource } from '../types';

/**
 * Create Google Search tool configuration for grounding
 * 
 * @returns Tool configuration object for Google Search
 * 
 * @example
 * ```typescript
 * const tools = [createGoogleSearchTool()];
 * const result = await model.generateContent({
 *   contents: 'What are the latest AI trends?',
 *   tools
 * });
 * ```
 */
export function createGoogleSearchTool() {
    return {
        googleSearch: {}
    };
}

/**
 * Parse grounding metadata from model response
 * 
 * @param response - The model response containing grounding metadata
 * @returns Parsed grounding metadata with sources
 * 
 * @example
 * ```typescript
 * const metadata = parseGroundingMetadata(response);
 * console.log('Sources:', metadata.sources);
 * console.log('Search queries:', metadata.searchQueries);
 * ```
 */
export function parseGroundingMetadata(response: any): {
    sources: GroundingSource[];
    searchQueries: string[];
    searchEntryPoint?: string;
} {
    const groundingMetadata = response.groundingMetadata;

    if (!groundingMetadata) {
        return {
            sources: [],
            searchQueries: []
        };
    }

    // Extract web sources
    const sources: GroundingSource[] = [];
    if (groundingMetadata.groundingChunks) {
        for (const chunk of groundingMetadata.groundingChunks) {
            if (chunk.web) {
                sources.push({
                    uri: chunk.web.uri,
                    title: chunk.web.title || chunk.web.uri
                });
            }
        }
    }

    // Extract search queries
    const searchQueries = groundingMetadata.webSearchQueries || [];

    // Extract search entry point
    const searchEntryPoint = groundingMetadata.searchEntryPoint?.renderedContent;

    return {
        sources,
        searchQueries,
        searchEntryPoint
    };
}

/**
 * Format grounding sources for display
 * 
 * @param sources - Array of grounding sources
 * @returns Formatted markdown string with sources
 * 
 * @example
 * ```typescript
 * const markdown = formatGroundingSources(metadata.sources);
 * console.log(markdown);
 * // ## Sources
 * // - [Example Title](https://example.com)
 * ```
 */
export function formatGroundingSources(sources: GroundingSource[]): string {
    if (sources.length === 0) {
        return '';
    }

    const formatted = sources
        .map((source, index) => `${index + 1}. [${source.title}](${source.uri})`)
        .join('\n');

    return `\n\n## Sources\n\n${formatted}`;
}

/**
 * Extract grounding supports (which parts of the text are grounded)
 * 
 * @param response - The model response
 * @returns Array of grounded text segments with their sources
 * 
 * @example
 * ```typescript
 * const supports = extractGroundingSupports(response);
 * supports.forEach(support => {
 *   console.log(`"${support.text}" is supported by ${support.sourceCount} sources`);
 * });
 * ```
 */
export function extractGroundingSupports(response: any): Array<{
    text: string;
    startIndex: number;
    endIndex: number;
    sourceIndices: number[];
    sourceCount: number;
}> {
    const groundingMetadata = response.groundingMetadata;

    if (!groundingMetadata?.groundingSupports) {
        return [];
    }

    return groundingMetadata.groundingSupports.map((support: any) => ({
        text: support.segment.text,
        startIndex: support.segment.startIndex,
        endIndex: support.segment.endIndex,
        sourceIndices: support.groundingChunkIndices,
        sourceCount: support.groundingChunkIndices.length
    }));
}

/**
 * Check if a response has grounding data
 * 
 * @param response - The model response
 * @returns True if response has grounding metadata
 */
export function hasGroundingData(response: any): boolean {
    return !!(response.groundingMetadata && response.groundingMetadata.groundingChunks);
}

/**
 * Create a grounding summary for logging/display
 * 
 * @param response - The model response
 * @returns Summary object with grounding statistics
 */
export function createGroundingSummary(response: any) {
    const metadata = parseGroundingMetadata(response);
    const supports = extractGroundingSupports(response);

    return {
        hasGrounding: hasGroundingData(response),
        sourceCount: metadata.sources.length,
        searchQueryCount: metadata.searchQueries.length,
        groundedSegmentCount: supports.length,
        sources: metadata.sources,
        searchQueries: metadata.searchQueries
    };
}
