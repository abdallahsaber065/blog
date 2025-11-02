// Streaming utilities for AI responses
import { StreamChunk, StreamHandler } from '../types';

/**
 * Stream content generation with Server-Sent Events
 * 
 * @param response - Streaming response from model
 * @param onChunk - Callback for each chunk
 * @returns Complete text when streaming finishes
 * 
 * @example
 * ```typescript
 * const stream = await model.generateContentStream({
 *   contents: 'Write a story'
 * });
 * 
 * const fullText = await streamContent(stream, (chunk) => {
 *   process.stdout.write(chunk.text || '');
 * });
 * ```
 */
export async function streamContent(
    response: any,
    onChunk: StreamHandler
): Promise<string> {
    let fullText = '';

    try {
        for await (const chunk of response.stream) {
            const text = chunk.text();

            if (text) {
                fullText += text;
                onChunk({
                    text,
                    thought: false,
                    done: false
                });
            }
        }

        // Send done signal
        onChunk({
            done: true
        });

        return fullText;
    } catch (error: any) {
        onChunk({
            done: true,
            error: error.message || 'Streaming error'
        });
        throw error;
    }
}

/**
 * Stream with thinking mode support
 * 
 * Separates thoughts from actual content
 * 
 * @param response - Streaming response with thinking
 * @param onChunk - Callback for each chunk
 * @returns Object with full text and thoughts
 * 
 * @example
 * ```typescript
 * const stream = await model.generateContentStream({
 *   contents: 'Explain quantum computing',
 *   generationConfig: {
 *     thinkingConfig: { thinkingBudget: 2048 }
 *   }
 * });
 * 
 * const result = await streamWithThinking(stream, (chunk) => {
 *   if (chunk.thought) {
 *     console.log('[Thinking]:', chunk.text);
 *   } else {
 *     console.log(chunk.text);
 *   }
 * });
 * ```
 */
export async function streamWithThinking(
    response: any,
    onChunk: StreamHandler
): Promise<{ text: string; thoughts: string[] }> {
    let fullText = '';
    const thoughts: string[] = [];

    try {
        for await (const chunk of response.stream) {
            // Check if this is a thought
            const isThought = chunk.usageMetadata?.thoughtTokenCount > 0;
            const text = chunk.text();

            if (text) {
                if (isThought) {
                    thoughts.push(text);
                    onChunk({
                        text,
                        thought: true,
                        done: false
                    });
                } else {
                    fullText += text;
                    onChunk({
                        text,
                        thought: false,
                        done: false
                    });
                }
            }
        }

        onChunk({ done: true });

        return { text: fullText, thoughts };
    } catch (error: any) {
        onChunk({
            done: true,
            error: error.message || 'Streaming error'
        });
        throw error;
    }
}

/**
 * Create a Server-Sent Events (SSE) response for Next.js API routes
 * 
 * @param streamGenerator - Async generator for stream chunks
 * @returns ReadableStream for SSE
 * 
 * @example
 * ```typescript
 * // In API route
 * export async function POST(req: Request) {
 *   const stream = model.generateContentStream({ ... });
 *   
 *   const sseStream = createSSEStream(async function* () {
 *     for await (const chunk of stream.stream) {
 *       yield { data: chunk.text() };
 *     }
 *   });
 *   
 *   return new Response(sseStream, {
 *     headers: {
 *       'Content-Type': 'text/event-stream',
 *       'Cache-Control': 'no-cache',
 *       'Connection': 'keep-alive'
 *     }
 *   });
 * }
 * ```
 */
export function createSSEStream(
    streamGenerator: () => AsyncGenerator<{ data: any; event?: string; id?: string }>
): ReadableStream {
    return new ReadableStream({
        async start(controller) {
            const encoder = new TextEncoder();

            try {
                for await (const chunk of streamGenerator()) {
                    let message = '';

                    if (chunk.id) {
                        message += `id: ${chunk.id}\n`;
                    }

                    if (chunk.event) {
                        message += `event: ${chunk.event}\n`;
                    }

                    message += `data: ${JSON.stringify(chunk.data)}\n\n`;

                    controller.enqueue(encoder.encode(message));
                }

                // Send done event
                controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                controller.close();
            } catch (error: any) {
                controller.enqueue(
                    encoder.encode(`event: error\ndata: ${JSON.stringify({ error: error.message })}\n\n`)
                );
                controller.close();
            }
        }
    });
}

/**
 * Parse SSE stream on client side
 * 
 * @param response - Fetch response with SSE stream
 * @param onChunk - Callback for each chunk
 * 
 * @example
 * ```typescript
 * // In client component
 * const response = await fetch('/api/generate', { method: 'POST' });
 * 
 * await parseSSEStream(response, (chunk) => {
 *   setContent(prev => prev + chunk.text);
 * });
 * ```
 */
export async function parseSSEStream(
    response: Response,
    onChunk: (data: any) => void
): Promise<void> {
    const reader = response.body?.getReader();
    if (!reader) throw new Error('No reader available');

    const decoder = new TextDecoder();
    let buffer = '';

    try {
        while (true) {
            const { done, value } = await reader.read();

            if (done) break;

            buffer += decoder.decode(value, { stream: true });

            // Split by double newline (SSE message boundary)
            const messages = buffer.split('\n\n');

            // Keep the last incomplete message in buffer
            buffer = messages.pop() || '';

            for (const message of messages) {
                if (message.trim() === '') continue;
                if (message === 'data: [DONE]') continue;

                // Parse SSE message
                const lines = message.split('\n');
                let data: any = null;
                let event: string | null = null;

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            data = JSON.parse(line.slice(6));
                        } catch {
                            data = line.slice(6);
                        }
                    } else if (line.startsWith('event: ')) {
                        event = line.slice(7);
                    }
                }

                if (data) {
                    onChunk(data);
                }
            }
        }
    } finally {
        reader.releaseLock();
    }
}

/**
 * Buffer stream chunks for batch processing
 * 
 * @param response - Streaming response
 * @param batchSize - Number of chunks per batch
 * @param onBatch - Callback for each batch
 * @returns Complete text
 * 
 * @example
 * ```typescript
 * await streamWithBatching(stream, 5, (batch) => {
 *   console.log(`Received ${batch.length} chunks:`, batch.join(''));
 * });
 * ```
 */
export async function streamWithBatching(
    response: any,
    batchSize: number,
    onBatch: (chunks: string[]) => void
): Promise<string> {
    let fullText = '';
    let batch: string[] = [];

    try {
        for await (const chunk of response.stream) {
            const text = chunk.text();

            if (text) {
                fullText += text;
                batch.push(text);

                if (batch.length >= batchSize) {
                    onBatch(batch);
                    batch = [];
                }
            }
        }

        // Send remaining batch
        if (batch.length > 0) {
            onBatch(batch);
        }

        return fullText;
    } catch (error) {
        throw error;
    }
}

/**
 * Stream with progress tracking
 * 
 * @param response - Streaming response
 * @param onProgress - Progress callback
 * @returns Complete text
 * 
 * @example
 * ```typescript
 * await streamWithProgress(stream, (progress) => {
 *   console.log(`${progress.percentage}% complete (${progress.chunks} chunks)`);
 * });
 * ```
 */
export async function streamWithProgress(
    response: any,
    onProgress: (progress: {
        chunks: number;
        characters: number;
        percentage?: number;
        estimatedTotal?: number;
    }) => void
): Promise<string> {
    let fullText = '';
    let chunks = 0;

    try {
        for await (const chunk of response.stream) {
            const text = chunk.text();

            if (text) {
                fullText += text;
                chunks++;

                onProgress({
                    chunks,
                    characters: fullText.length
                });
            }
        }

        // Final progress
        onProgress({
            chunks,
            characters: fullText.length,
            percentage: 100
        });

        return fullText;
    } catch (error) {
        throw error;
    }
}

/**
 * Collect entire stream into single response
 * 
 * Useful when you need the complete response before processing
 * 
 * @param response - Streaming response
 * @returns Complete text and metadata
 * 
 * @example
 * ```typescript
 * const result = await collectStream(stream);
 * console.log('Full response:', result.text);
 * console.log('Token usage:', result.usageMetadata);
 * ```
 */
export async function collectStream(response: any): Promise<{
    text: string;
    usageMetadata?: any;
    candidates?: any[];
}> {
    let fullText = '';
    let lastChunk: any;

    for await (const chunk of response.stream) {
        const text = chunk.text();
        if (text) {
            fullText += text;
        }
        lastChunk = chunk;
    }

    return {
        text: fullText,
        usageMetadata: lastChunk?.usageMetadata,
        candidates: lastChunk?.candidates
    };
}

/**
 * Stream with automatic retry on error
 * 
 * @param streamFn - Function that creates the stream
 * @param maxRetries - Maximum number of retries
 * @param onChunk - Chunk handler
 * @returns Complete text
 * 
 * @example
 * ```typescript
 * const result = await streamWithRetry(
 *   () => model.generateContentStream({ contents: 'test' }),
 *   3,
 *   (chunk) => console.log(chunk.text)
 * );
 * ```
 */
export async function streamWithRetry(
    streamFn: () => Promise<any>,
    maxRetries: number,
    onChunk: StreamHandler
): Promise<string> {
    let lastError: any;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            const response = await streamFn();
            return await streamContent(response, onChunk);
        } catch (error: any) {
            lastError = error;

            if (attempt < maxRetries) {
                // Wait before retrying (exponential backoff)
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
            }
        }
    }

    throw lastError;
}

/**
 * Create a rate-limited stream handler
 * 
 * @param onChunk - Original chunk handler
 * @param minDelayMs - Minimum delay between chunks
 * @returns Rate-limited handler
 * 
 * @example
 * ```typescript
 * const rateLimited = createRateLimitedHandler(
 *   (chunk) => console.log(chunk.text),
 *   100 // 100ms between chunks
 * );
 * 
 * await streamContent(stream, rateLimited);
 * ```
 */
export function createRateLimitedHandler(
    onChunk: StreamHandler,
    minDelayMs: number
): StreamHandler {
    let lastCallTime = 0;

    return async (chunk: StreamChunk) => {
        const now = Date.now();
        const timeSinceLastCall = now - lastCallTime;

        if (timeSinceLastCall < minDelayMs) {
            await new Promise(resolve => setTimeout(resolve, minDelayMs - timeSinceLastCall));
        }

        lastCallTime = Date.now();
        return onChunk(chunk);
    };
}
