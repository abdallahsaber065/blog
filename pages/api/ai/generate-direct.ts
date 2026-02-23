/**
 * Outline-free AI content generation — Netlify Edge Function.
 *
 * Runs on the Edge Runtime so there is NO 10/26s timeout and SSE streaming
 * works natively.  Auth is handled via next-auth/jwt `getToken()` which is
 * Edge-compatible (unlike `getServerSession`).
 *
 * Flow:
 *  1. (Optional) Pass voice notes inline to Gemini.
 *  2. (Optional) Research the topic using Gemini + Google Search grounding.
 *  3. Stream the full blog post (SSE) using the research as context.
 */

import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { GoogleGenAI } from '@google/genai';
import { buildDirectContentPrompt } from '@/lib/ai/prompts';
import type { GenerateDirectRequest } from '@/lib/ai/types';

// ── Edge Runtime ────────────────────────────────────────────────────────────
export const config = { runtime: 'edge' };

// ── Gemini client (Edge-safe — uses fetch internally) ───────────────────────
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not set');
  return new GoogleGenAI({ apiKey });
}

export default async function handler(req: NextRequest) {
  // ── Auth check via JWT (Edge-compatible) ────────────────────────────────
  const token = await getToken({ req, secret: process.env.SECRET_KEY });
  if (!token) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const body = (await req.json()) as GenerateDirectRequest;
  const {
    topic,
    context_urls = [],
    files = [],
    voice_note_base64,
    voice_note_mime = 'audio/webm',
    include_images = false,
    user_custom_instructions = '',
    website_type = 'blog',
    enable_web_search = false,
  } = body;

  if (!topic || topic.trim().length === 0) {
    return new Response(JSON.stringify({ error: 'Topic is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const client = getGeminiClient();

  try {
    const parts: any[] = [];

    // ── 1. Pass voice note directly ───────────────────────────────────────
    if (voice_note_base64) {
      // Edge Runtime: use atob instead of Buffer
      parts.push({
        inlineData: {
          data: voice_note_base64, // already base64
          mimeType: voice_note_mime,
        },
      });
    }

    // Pass images/files directly
    for (const fileUrl of files) {
      parts.push({
        fileData: { fileUri: fileUrl },
      });
    }

    // ── 2. Research via Google Search grounding (optional) ─────────────────
    let researchSummary = '';

    if (enable_web_search) {
      const researchPrompt = `Research the following topic thoroughly to provide up-to-date information for a technical blog post: "${topic}".\n\nSummarise: key concepts, latest developments, real-world examples, statistics, and technical details.`;

      const urlContext =
        context_urls.length > 0
          ? `\n\nAlso consider information from these URLs: ${context_urls.join(', ')}`
          : '';

      const researchResponse = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: researchPrompt + urlContext,
        config: {
          temperature: 0.3,
          maxOutputTokens: 8192,
          tools: [{ googleSearch: {} }, { urlContext: {} }],
        } as any,
      });

      researchSummary =
        (researchResponse as any).candidates?.[0]?.content?.parts?.[0]?.text ??
        (typeof (researchResponse as any).text === 'function'
          ? (researchResponse as any).text()
          : '') ??
        '';
    }

    // ── 3. Stream the final blog post (SSE) ───────────────────────────────
    let urlContext = '';
    if (context_urls && context_urls.length > 0) {
      urlContext = `\n\nAlso consider information from these URLs: ${context_urls.join(', ')}`;
    }

    const contentPrompt = buildDirectContentPrompt(
      topic,
      researchSummary + urlContext,
      '', // No separate transcript needed
      include_images,
      user_custom_instructions,
      website_type,
    );

    parts.push({ text: contentPrompt });

    const tools: any[] = [{ urlContext: {} }];
    if (enable_web_search) {
      tools.push({ googleSearch: {} });
    }

    // Use a TransformStream to convert the async generator into a ReadableStream
    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    // Start streaming in a non-blocking way
    (async () => {
      try {
        const streamResponse = await client.models.generateContentStream({
          model: 'gemini-2.5-flash',
          contents: [{ role: 'user', parts }],
          config: {
            temperature: 0.75,
            maxOutputTokens: 8192,
            systemInstruction: {
              role: 'system',
              parts: [
                {
                  text: 'You are a world-class content writer. Write complete, detailed, valuable blog posts in Markdown.',
                },
              ],
            },
            tools,
          } as any,
        });

        let fullContent = '';

        for await (const chunk of streamResponse as any) {
          const chunkText: string =
            typeof chunk.text === 'function'
              ? chunk.text()
              : (chunk?.candidates?.[0]?.content?.parts?.[0]?.text ?? '');

          if (chunkText) {
            fullContent += chunkText;
            await writer.write(
              encoder.encode(
                `data: ${JSON.stringify({ chunk: chunkText, done: false })}\n\n`,
              ),
            );
          }
        }

        await writer.write(
          encoder.encode(
            `data: ${JSON.stringify({ chunk: '', done: true, content: fullContent })}\n\n`,
          ),
        );
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'Unknown error';
        console.error('generate-direct stream error:', error);
        await writer.write(
          encoder.encode(
            `data: ${JSON.stringify({ error: msg, done: true })}\n\n`,
          ),
        );
      } finally {
        await writer.close();
      }
    })();

    return new Response(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    });
  } catch (error: unknown) {
    console.error('generate-direct error:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
