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
    // ── 1. Transcribe voice notes (if any) ─────────────────────────────────
    let voiceTranscript = '';
    if (voice_note_base64) {
      try {
        const audioBytes = Buffer.from(voice_note_base64, 'base64');
        const { text } = await gemini.generateFromAudio({
          audioData: audioBytes,
          mimeType: voice_note_mime,
          textPrompt:
            'Transcribe and summarise the key points from these voice notes. Return plain text, no preamble.',
        });
        voiceTranscript = text;
      } catch (err) {
        console.warn('Voice note transcription failed, skipping:', err);
      }
    }

    // ── 2. Research via Google Search grounding ─────────────────────────────
    const researchPrompt = `Research the following topic thoroughly to provide up-to-date information for a technical blog post: "${topic}".
    
Summarise: key concepts, latest developments, real-world examples, statistics, and technical details.`;

    const { text: researchSummary } = await gemini.generateWithWebSearch({
      model: 'gemini-2.5-flash',
      prompt: researchPrompt,
      contextUrls: context_urls,
      config: { temperature: 0.3, maxOutputTokens: 8192 },
    });

    // ── 3. Stream the final blog post ───────────────────────────────────────
    const contentPrompt = buildDirectContentPrompt(
      topic,
      researchSummary,
      voiceTranscript,
      include_images,
      user_custom_instructions,
      website_type
    );

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');

    // Build multimodal contents if files were attached
    type Part = { text: string } | { fileData: { fileUri: string; mimeType?: string } };
    const parts: Part[] = [{ text: contentPrompt }];
    for (const fileUrl of files) {
      // Files are already hosted URLs; send as fileData
      parts.push({ fileData: { fileUri: fileUrl } });
    }

    // Use the raw client for streaming (GeminiService wraps non-streaming calls only)
    // We access the underlying client through a typed helper on the service.
    // Since GeminiService doesn't expose streaming directly, we call the SDK directly.
    const { GoogleGenAI } = await import('@google/genai');
    const rawClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

    const streamResponse = await rawClient.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts }],
      config: {
        temperature: 0.75,
        maxOutputTokens: 8192,
        systemInstruction: `You are a world-class content writer. Write complete, detailed, valuable blog posts in Markdown.`,
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
        res.write(`data: ${JSON.stringify({ chunk: chunkText, done: false })}\n\n`);
      }
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
