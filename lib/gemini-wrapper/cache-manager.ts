/**
 * Caching Module
 * Manages context caching for cost optimization with large prompts
 */

import type { GeminiClient } from './client';
import type {
  CacheOptions,
  CachedContent,
  Content,
} from './types';

/**
 * Cache Manager
 * Handles cached content for reducing costs on repeated large prompts
 */
export class CacheManager {
  constructor(private client: GeminiClient) {}

  /**
   * Create a new cached content
   * Useful for caching large system instructions or context that will be reused
   * 
   * @param options - Cache creation options
   * @returns Created cached content metadata
   * 
   * @example
   * ```typescript
   * const cache = await cacheManager.create({
   *   model: "gemini-2.0-flash-exp",
   *   systemInstruction: "You are an expert in quantum physics...",
   *   contents: [largeContextDocument],
   *   ttlSeconds: 3600
   * });
   * 
   * // Use the cache in generation
   * const response = await textGen.generate({
   *   prompt: "Explain quantum entanglement",
   *   config: {
   *     cachedContent: cache.name
   *   }
   * });
   * ```
   */
  async create(options: CacheOptions): Promise<CachedContent> {
    const params: any = {
      model: options.model,
      contents: options.contents,
    };

    if (options.systemInstruction) {
      params.systemInstruction = options.systemInstruction;
    }

    if (options.tools && options.tools.length > 0) {
      params.tools = options.tools;
    }

    if (options.ttlSeconds) {
      params.ttl = `${options.ttlSeconds}s`;
    }

    const response = await this.client.caches.create(params);
    return response;
  }

  /**
   * Get cached content by name
   * 
   * @param name - Cache name
   * @returns Cached content metadata
   * 
   * @example
   * ```typescript
   * const cache = await cacheManager.get("cachedContents/abc123");
   * ```
   */
  async get(name: string): Promise<CachedContent> {
    return await this.client.caches.get({ name });
  }

  /**
   * List cached contents
   * 
   * @param pageSize - Number of items per page
   * @param pageToken - Token for pagination
   * @returns List of cached contents
   * 
   * @example
   * ```typescript
   * const response = await cacheManager.list(10);
   * for (const cache of response.cachedContents) {
   *   console.log(cache.name, cache.expireTime);
   * }
   * ```
   */
  async list(pageSize?: number, pageToken?: string) {
    const params: any = {};

    if (pageSize) {
      params.pageSize = pageSize;
    }

    if (pageToken) {
      params.pageToken = pageToken;
    }

    return await this.client.caches.list(params);
  }

  /**
   * Update a cached content's TTL
   * 
   * @param name - Cache name
   * @param ttlSeconds - New TTL in seconds
   * @returns Updated cached content
   * 
   * @example
   * ```typescript
   * const updated = await cacheManager.update(
   *   "cachedContents/abc123",
   *   7200
   * );
   * ```
   */
  async update(name: string, ttlSeconds: number): Promise<CachedContent> {
    const params: any = {
      name,
      ttl: `${ttlSeconds}s`,
    };
    return await this.client.caches.update(params);
  }

  /**
   * Delete a cached content
   * 
   * @param name - Cache name
   * 
   * @example
   * ```typescript
   * await cacheManager.delete("cachedContents/abc123");
   * ```
   */
  async delete(name: string): Promise<void> {
    await this.client.caches.delete({ name });
  }

  /**
   * Helper to create cache-friendly content from large text
   * 
   * @param text - Large text to cache
   * @param role - Content role (default: 'user')
   * @returns Content array suitable for caching
   */
  createContentFromText(text: string, role: 'user' | 'model' = 'user'): Content[] {
    return [
      {
        role,
        parts: [{ text }],
      },
    ];
  }

  /**
   * Check if a cache is still valid (not expired)
   * 
   * @param cache - Cached content metadata
   * @returns True if cache is still valid
   */
  isValid(cache: CachedContent): boolean {
    if (!cache.expireTime) {
      return true; // No expiration time means it doesn't expire
    }

    const expireTime = new Date(cache.expireTime);
    const now = new Date();

    return now < expireTime;
  }

  /**
   * Get the remaining TTL of a cache in seconds
   * 
   * @param cache - Cached content metadata
   * @returns Remaining TTL in seconds, or null if no expiration
   */
  getRemainingTTL(cache: CachedContent): number | null {
    if (!cache.expireTime) {
      return null;
    }

    const expireTime = new Date(cache.expireTime);
    const now = new Date();
    const remainingMs = expireTime.getTime() - now.getTime();

    return Math.max(0, Math.floor(remainingMs / 1000));
  }

  /**
   * Create a cache for a large document corpus
   * Useful for RAG (Retrieval Augmented Generation) applications
   * 
   * @param model - Model to use
   * @param documents - Array of document texts
   * @param systemInstruction - Optional system instruction
   * @param ttlSeconds - Time to live in seconds
   * @returns Created cached content
   * 
   * @example
   * ```typescript
   * const cache = await cacheManager.createDocumentCache(
   *   "gemini-2.0-flash-exp",
   *   [doc1, doc2, doc3],
   *   "You are a helpful assistant that answers based on the provided documents",
   *   3600
   * );
   * ```
   */
  async createDocumentCache(
    model: string,
    documents: string[],
    systemInstruction?: string,
    ttlSeconds?: number
  ): Promise<CachedContent> {
    const contents: Content[] = documents.map(doc => ({
      role: 'user',
      parts: [{ text: doc }],
    }));

    return this.create({
      model,
      systemInstruction,
      contents,
      ttlSeconds,
    });
  }
}
