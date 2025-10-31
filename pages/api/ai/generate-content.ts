// API route for generating content with streaming using Google Generative AI
import type { NextApiRequest, NextApiResponse } from 'next';
import { getModel } from '@/lib/ai/gemini-client';
import { buildContentPrompt } from '@/lib/ai/prompts';
import type { GenerateContentRequest } from '@/lib/ai/types';
import { authMiddleware } from '@/middleware/authMiddleware';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      topic,
      outline,
      search_terms = '',
      include_images = false,
      user_custom_instructions = '',
      website_type = 'blog',
    } = req.body as GenerateContentRequest;

    if (!topic || !outline) {
      return res.status(400).json({ error: 'Topic and outline are required' });
    }

    // Build the prompt
    const prompt = buildContentPrompt(
      topic,
      outline,
      search_terms,
      include_images,
      user_custom_instructions,
      website_type
    );

    // Get the model configured for content generation
    const model = getModel('content');

    // Set headers for streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');

    // Generate content with streaming
    const result = await model.generateContentStream(prompt);

    let fullContent = '';

    // Stream the response
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      fullContent += chunkText;
      
      // Send the chunk as Server-Sent Event
      res.write(`data: ${JSON.stringify({ chunk: chunkText, done: false })}\n\n`);
    }

    // Send final message indicating completion
    res.write(`data: ${JSON.stringify({ chunk: '', done: true, content: fullContent })}\n\n`);
    res.end();

  } catch (error: unknown) {
    console.error('Error generating content:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    // If streaming hasn't started, send JSON error
    if (!res.headersSent) {
      if (errorMessage.includes('API key')) {
        return res.status(500).json({ 
          error: 'AI service configuration error. Please contact administrator.' 
        });
      }

      return res.status(500).json({ 
        error: 'Failed to generate content. Please try again.' 
      });
    } else {
      // If streaming has started, send error as SSE
      res.write(`data: ${JSON.stringify({ error: errorMessage, done: true })}\n\n`);
      res.end();
    }
  }
}

export default function securedHandler(req: NextApiRequest, res: NextApiResponse) {
  return authMiddleware(req, res, handler);
}
