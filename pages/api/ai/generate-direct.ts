/**
 * Outline-free AI content generation.
 *
 * Flow:
 *  1. (Optional) Transcribe voice notes via Gemini audio understanding.
 *  2. Research the topic using Gemini + Google Search grounding.
 *  3. Generate the full blog post (streaming SSE) using the research as context.
 *  4. Inline images / files are forwarded to the model when provided.
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { GeminiService } from '@/lib/ai/gemini-client/service';
import { buildDirectContentPrompt } from '@/lib/ai/prompts';
import type { GenerateDirectRequest } from '@/lib/ai/types';
import { authMiddleware } from '@/middleware/authMiddleware';

const gemini = new GeminiService({
  defaultModel: 'gemini-3-flash',
  defaultGenerationConfig: {
    temperature: 0.75,
    maxOutputTokens: 8192,
  },
});

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    topic,
    context_urls = [],
    files = [],
    voice_note_base64,
    voice_note_mime = 'audio/webm',
    include_images = false,
    user_custom_instructions = '',
    website_type = 'blog',
  } = req.body as GenerateDirectRequest;

  if (!topic || topic.trim().length === 0) {
    return res.status(400).json({ error: 'Topic is required' });
  }

  try {
    const parts: any[] = [];

    // ── 1. Pass voice note directly ──────────────────────────────────────────
    if (voice_note_base64) {
      const audioBytes = Buffer.from(voice_note_base64, 'base64');
      parts.push({
        type: 'inlineBytes',
        data: audioBytes,
        mimeType: voice_note_mime,
      });
    }

    // Pass images/files directly
    for (const fileUrl of files) {
      parts.push({
        type: 'file',
        fileUri: fileUrl,
      });
    }

    // ── 2. Research via Google Search grounding (Optional) ──────────────────
    let researchSummary = '';
    const enable_web_search = req.body.enable_web_search ?? false;

    if (enable_web_search) {
      const researchPrompt = `Research the following topic thoroughly to provide up-to-date information for a technical blog post: "${topic}".
      
Summarise: key concepts, latest developments, real-world examples, statistics, and technical details.`;

      const { text } = await gemini.generateWithWebSearch({
        model: 'gemini-2.5-flash',
        prompt: researchPrompt,
        contextUrls: context_urls,
        config: { temperature: 0.3, maxOutputTokens: 8192 },
      });
      researchSummary = text;
    }

    // ── 3. Stream the final blog post ───────────────────────────────────────
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
      website_type
    );

    parts.push({ type: 'text', text: contentPrompt });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');

    const tools: any[] = [{ urlContext: {} }];
    if (enable_web_search) {
      tools.push({ googleSearch: {} });
    }

    const stream = gemini.generateTextStream({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts }],
      tools,
      systemInstruction: `You are a world-class content writer. Write complete, detailed, valuable blog posts in Markdown.`,
      config: {
        temperature: 0.75,
        maxOutputTokens: 8192,
      },
    });

    let fullContent = '';
    for await (const chunkText of stream) {
      fullContent += chunkText;
      res.write(`data: ${JSON.stringify({ chunk: chunkText, done: false })}\n\n`);
    }

    res.write(`data: ${JSON.stringify({ chunk: '', done: true, content: fullContent })}\n\n`);
    res.end();
  } catch (error: unknown) {
    console.error('generate-direct error:', error);
    const msg =
      error instanceof Error ? error.message : 'Unknown error';

    if (!res.headersSent) {
      return res.status(500).json({ error: msg });
    }
    res.write(`data: ${JSON.stringify({ error: msg, done: true })}\n\n`);
    res.end();
  }
}

export default function securedHandler(req: NextApiRequest, res: NextApiResponse) {
  return authMiddleware(req, res, handler);
}
