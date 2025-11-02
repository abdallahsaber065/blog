// API route for generating content with streaming using Google Generative AI
import { getAIClient } from '@/lib/ai/client';
import { getModelConfig } from '@/lib/ai/config';
import { buildContentPrompt } from '@/lib/ai/prompts';
import { createCodeExecutionTool, createGoogleSearchTool } from '@/lib/ai/tools';
import type { GenerateContentRequest } from '@/lib/ai/types';
import { authMiddleware } from '@/middleware/authMiddleware';
import type { NextApiRequest, NextApiResponse } from 'next';

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
      files = [],
      images = [],
      use_search = false,
      use_code_execution = false,
      thinking_budget,
    } = req.body as GenerateContentRequest;

    if (!topic || !outline) {
      return res.status(400).json({ error: 'Topic and outline are required' });
    }

    // Build the prompt with enhanced options
    const prompt = buildContentPrompt(
      topic,
      outline,
      search_terms,
      include_images,
      user_custom_instructions,
      website_type,
      {
        useSearch: use_search,
        useCodeExecution: use_code_execution,
        hasFiles: files.length > 0,
        hasImages: images.length > 0,
        enableThinking: thinking_budget !== undefined && thinking_budget !== 0
      }
    );

    // Get AI client and model configuration
    const client = getAIClient();
    let config = getModelConfig('content');

    // Override thinking budget if provided
    if (thinking_budget !== undefined) {
      config = {
        ...config,
        thinkingConfig: {
          thinkingBudget: thinking_budget
        }
      };
    }

    // Add tools if requested
    const tools: any[] = [];
    if (use_search) {
      tools.push(createGoogleSearchTool());
    }
    if (use_code_execution) {
      tools.push(createCodeExecutionTool());
    }

    // Build generation config
    const generationConfig: any = {
      temperature: config.temperature,
      topP: config.topP,
      topK: config.topK,
      maxOutputTokens: config.maxOutputTokens,
    };

    // Add thinking config if enabled (disable if thinking_budget is 0)
    if (config.thinkingConfig && config.thinkingConfig.thinkingBudget !== 0) {
      generationConfig.thinkingConfig = config.thinkingConfig;
    } else if (thinking_budget === 0) {
      generationConfig.thinkingConfig = { thinkingBudget: 0 };
    }

    // Set headers for streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');

    // Generate content with streaming using the new @google/genai API
    const response = await client.models.generateContentStream({
      model: config.model,
      contents: prompt,
      config: {
        ...generationConfig,
        ...(tools.length > 0 && { tools })
      }
    });

    let fullContent = '';

    // Stream the response
    for await (const chunk of response) {
      const chunkText = chunk.text || '';
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
