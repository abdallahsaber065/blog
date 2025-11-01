// API route for generating content outline using Google Gemini API
import type { NextApiRequest, NextApiResponse } from 'next';
import { getGeminiWrapper, getConfig } from '@/lib/ai/gemini-wrapper-client';
import { buildOutlinePrompt } from '@/lib/ai/prompts';
import type { GenerateOutlineRequest, GenerateOutlineResponse } from '@/lib/ai/types';
import { authMiddleware } from '@/middleware/authMiddleware';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      topic,
      num_of_keywords = 20,
      user_custom_instructions = '',
      num_of_points = null,
      website_type = 'blog',
    } = req.body as GenerateOutlineRequest;

    if (!topic || topic.trim().length === 0) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    // Build the prompt
    const prompt = buildOutlinePrompt(
      topic,
      num_of_keywords,
      num_of_points,
      user_custom_instructions,
      website_type
    );

    // Get the Gemini wrapper
    const gemini = getGeminiWrapper();
    const config = getConfig('outline');

    // Generate the outline with structured output
    const response = await gemini.text.generateStructured({
      prompt,
      schema: {
        type: 'object',
        properties: {
          main_title: { type: 'string' },
          introduction: { type: 'string' },
          sections: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                description: { type: 'string' },
                points: {
                  type: 'array',
                  items: { type: 'string' }
                }
              }
            }
          },
          conclusion: { type: 'string' },
          search_terms: {
            type: 'array',
            items: { type: 'string' }
          }
        }
      },
      config,
    });

    // Parse the JSON response
    let outlineData;
    try {
      outlineData = JSON.parse(response.text || '{}');
    } catch (parseError) {
      console.error('Failed to parse AI response:', response.text);
      return res.status(500).json({ 
        error: 'Failed to parse AI response. Please try again.' 
      });
    }

    // Extract search terms if present
    const searchTerms = outlineData.search_terms 
      ? outlineData.search_terms.join(', ') 
      : '';

    const response_data: GenerateOutlineResponse = {
      outline: {
        main_title: outlineData.main_title,
        introduction: outlineData.introduction,
        sections: outlineData.sections,
        conclusion: outlineData.conclusion,
      },
      search_terms: searchTerms,
    };

    return res.status(200).json(response_data);
  } catch (error: unknown) {
    console.error('Error generating outline:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    // Check for specific error types
    if (errorMessage.includes('API key')) {
      return res.status(500).json({ 
        error: 'AI service configuration error. Please contact administrator.' 
      });
    }

    return res.status(500).json({ 
      error: 'Failed to generate outline. Please try again.' 
    });
  }
}

export default function securedHandler(req: NextApiRequest, res: NextApiResponse) {
  return authMiddleware(req, res, handler);
}
