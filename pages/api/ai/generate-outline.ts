// API route for generating content outline using Google Generative AI
import { getAIClient } from '@/lib/ai/client';
import { getModelConfig } from '@/lib/ai/config';
import { buildOutlinePrompt } from '@/lib/ai/prompts';
import type { GenerateOutlineRequest, GenerateOutlineResponse } from '@/lib/ai/types';
import { authMiddleware } from '@/middleware/authMiddleware';
import type { NextApiRequest, NextApiResponse } from 'next';

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
      files = [],
      images = [],
      use_search = false,
      thinking_budget,
    } = req.body as GenerateOutlineRequest;

    if (!topic || topic.trim().length === 0) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    // Build the prompt with enhanced options
    const prompt = buildOutlinePrompt(
      topic,
      num_of_keywords,
      num_of_points,
      user_custom_instructions,
      website_type,
      {
        useSearch: use_search,
        hasFiles: files.length > 0,
        hasImages: images.length > 0,
        enableThinking: thinking_budget !== undefined && thinking_budget !== 0
      }
    );

    // Get AI client and model configuration
    const client = getAIClient();
    let config = getModelConfig('outline');

    // Override thinking budget if provided
    if (thinking_budget !== undefined) {
      config = {
        ...config,
        thinkingConfig: {
          thinkingBudget: thinking_budget
        }
      };
    }

    const model = (client as any).getGenerativeModel({
      model: config.model,
      generationConfig: {
        temperature: config.temperature,
        topP: config.topP,
        topK: config.topK,
        maxOutputTokens: config.maxOutputTokens,
        responseMimeType: config.responseMimeType,
        ...(config.responseSchema && { responseSchema: config.responseSchema }),
        ...(config.thinkingConfig && { thinkingConfig: config.thinkingConfig })
      },
      ...(config.tools && { tools: config.tools }),
      ...(config.systemInstruction && { systemInstruction: config.systemInstruction })
    });

    // Generate the outline with structured output
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Parse the JSON response
    let outlineData;
    try {
      outlineData = JSON.parse(text);
    } catch (parseError) {
      console.error('Failed to parse AI response:', text);
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
