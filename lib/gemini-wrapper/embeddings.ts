/**
 * Embeddings Module
 * Handles text and content embeddings generation
 */

import type { GeminiClient } from './client';
import type {
  EmbeddingOptions,
  EmbedContentResponse,
  Content,
} from './types';

/**
 * Embeddings Manager
 */
export class Embeddings {
  constructor(private client: GeminiClient) {}

  /**
   * Generate embeddings for text or content
   * 
   * @param options - Embedding generation options
   * @returns Embedding response with vector
   * 
   * @example
   * ```typescript
   * const response = await embeddings.embed({
   *   content: "Machine learning is a subset of AI",
   *   taskType: "RETRIEVAL_DOCUMENT"
   * });
   * 
   * console.log(response.embedding.values);
   * ```
   */
  async embed(options: EmbeddingOptions): Promise<EmbedContentResponse> {
    const model = options.model || 'text-embedding-004';
    const content = this.normalizeContent(options.content);

    const params: any = {
      model,
      contents: content,
    };

    if (options.taskType) {
      params.taskType = options.taskType;
    }

    if (options.title) {
      params.title = options.title;
    }

    return await this.client.models.embedContent(params);
  }

  /**
   * Generate embeddings for multiple texts in batch
   * 
   * @param texts - Array of texts to embed
   * @param taskType - Optional task type
   * @param model - Optional model to use
   * @returns Array of embedding responses
   * 
   * @example
   * ```typescript
   * const embeddings = await embeddingsManager.embedBatch([
   *   "First document",
   *   "Second document",
   *   "Third document"
   * ], "RETRIEVAL_DOCUMENT");
   * ```
   */
  async embedBatch(
    texts: string[],
    taskType?: EmbeddingOptions['taskType'],
    model?: string
  ): Promise<EmbedContentResponse[]> {
    const embedPromises = texts.map(text =>
      this.embed({
        content: text,
        taskType,
        model,
      })
    );

    return await Promise.all(embedPromises);
  }

  /**
   * Generate embedding for a query (optimized for search queries)
   * 
   * @param query - Search query text
   * @param model - Optional model to use
   * @returns Embedding response
   * 
   * @example
   * ```typescript
   * const queryEmbedding = await embeddings.embedQuery(
   *   "best practices for react hooks"
   * );
   * ```
   */
  async embedQuery(query: string, model?: string): Promise<EmbedContentResponse> {
    return this.embed({
      content: query,
      taskType: 'RETRIEVAL_QUERY',
      model,
    });
  }

  /**
   * Generate embedding for a document (optimized for document storage)
   * 
   * @param document - Document text
   * @param title - Optional document title
   * @param model - Optional model to use
   * @returns Embedding response
   * 
   * @example
   * ```typescript
   * const docEmbedding = await embeddings.embedDocument(
   *   "Full document text here...",
   *   "React Hooks Best Practices"
   * );
   * ```
   */
  async embedDocument(
    document: string,
    title?: string,
    model?: string
  ): Promise<EmbedContentResponse> {
    return this.embed({
      content: document,
      taskType: 'RETRIEVAL_DOCUMENT',
      title,
      model,
    });
  }

  /**
   * Calculate cosine similarity between two embedding vectors
   * 
   * @param embedding1 - First embedding vector
   * @param embedding2 - Second embedding vector
   * @returns Similarity score between -1 and 1
   * 
   * @example
   * ```typescript
   * const similarity = embeddings.cosineSimilarity(
   *   response1.embedding.values,
   *   response2.embedding.values
   * );
   * ```
   */
  cosineSimilarity(embedding1: number[], embedding2: number[]): number {
    if (embedding1.length !== embedding2.length) {
      throw new Error('Embeddings must have the same length');
    }

    let dotProduct = 0;
    let magnitude1 = 0;
    let magnitude2 = 0;

    for (let i = 0; i < embedding1.length; i++) {
      dotProduct += embedding1[i] * embedding2[i];
      magnitude1 += embedding1[i] * embedding1[i];
      magnitude2 += embedding2[i] * embedding2[i];
    }

    magnitude1 = Math.sqrt(magnitude1);
    magnitude2 = Math.sqrt(magnitude2);

    if (magnitude1 === 0 || magnitude2 === 0) {
      return 0;
    }

    return dotProduct / (magnitude1 * magnitude2);
  }

  /**
   * Find the most similar embeddings from a list
   * 
   * @param queryEmbedding - Query embedding vector
   * @param candidateEmbeddings - Array of candidate embeddings
   * @param topK - Number of top results to return
   * @returns Array of indices and similarity scores, sorted by similarity
   * 
   * @example
   * ```typescript
   * const results = embeddings.findSimilar(
   *   queryEmbed.embedding.values,
   *   docEmbeds.map(e => e.embedding.values),
   *   5
   * );
   * ```
   */
  findSimilar(
    queryEmbedding: number[],
    candidateEmbeddings: number[][],
    topK: number = 5
  ): Array<{ index: number; similarity: number }> {
    const similarities = candidateEmbeddings.map((embedding, index) => ({
      index,
      similarity: this.cosineSimilarity(queryEmbedding, embedding),
    }));

    // Sort by similarity in descending order
    similarities.sort((a, b) => b.similarity - a.similarity);

    // Return top K results
    return similarities.slice(0, topK);
  }

  /**
   * Normalize content to the expected format
   */
  private normalizeContent(content: string | Content | Content[]): Content[] {
    if (typeof content === 'string') {
      return [{ role: 'user', parts: [{ text: content }] }];
    }

    if (Array.isArray(content)) {
      return content;
    }

    return [content];
  }
}
