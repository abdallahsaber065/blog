// API route for generating post metadata using Google Generative AI
import type { NextApiRequest, NextApiResponse } from 'next';
import { getModel } from '@/lib/ai/gemini-client';
import { buildMetadataPrompt } from '@/lib/ai/prompts';
import type { GenerateMetadataRequest, GenerateMetadataResponse } from '@/lib/ai/types';
import { authMiddleware } from '@/middleware/authMiddleware';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      topic,
      content,
      old_tags = [],
      old_categories = [],
    } = req.body as GenerateMetadataRequest;

    if (!topic || !content) {
      return res.status(400).json({ error: 'Topic and content are required' });
    }

    // Build the prompt
    const prompt = buildMetadataPrompt(topic, content, old_tags, old_categories);

    // Get the model configured for metadata generation
    const model = getModel('metadata');

    // Generate the metadata with structured output
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Parse the JSON response
    let metadata: GenerateMetadataResponse;
    try {
      metadata = JSON.parse(text);
    } catch (parseError) {
      console.error('Failed to parse AI response:', text);
      return res.status(500).json({ 
        error: 'Failed to parse AI response. Please try again.' 
      });
    }

    // Validate the response structure
    if (!metadata.title || !metadata.excerpt || !Array.isArray(metadata.tags)) {
      return res.status(500).json({ 
        error: 'Invalid metadata format received from AI.' 
      });
    }

    return res.status(200).json(metadata);
  } catch (error: unknown) {
    console.error('Error generating metadata:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    // Check for specific error types
    if (errorMessage.includes('API key')) {
      return res.status(500).json({ 
        error: 'AI service configuration error. Please contact administrator.' 
      });
    }

    return res.status(500).json({ 
      error: 'Failed to generate metadata. Please try again.' 
    });
  }
}

export default function securedHandler(req: NextApiRequest, res: NextApiResponse) {
  return authMiddleware(req, res, handler);
}
