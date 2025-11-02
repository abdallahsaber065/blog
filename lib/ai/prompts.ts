// Prompt templates for AI content generation
import { ContentOutline } from './types';

// ============================================================================
// Outline Generation Prompts
// ============================================================================

export function buildOutlinePrompt(
  topic: string,
  numOfKeywords: number,
  numOfPoints: number | null,
  userCustomInstructions: string,
  websiteType: string = 'blog',
  options?: {
    useSearch?: boolean;
    hasFiles?: boolean;
    hasImages?: boolean;
    enableThinking?: boolean;
  }
): string {
  const pointsInstruction = numOfPoints
    ? `Each section should contain approximately ${numOfPoints} key points.`
    : '';

  const searchHint = options?.useSearch
    ? '\n\nNote: You have access to Google Search. Use it to verify facts, find recent trends, and gather authoritative sources related to the topic.'
    : '';

  const multimodalHint = (options?.hasFiles || options?.hasImages)
    ? '\n\nNote: The user has provided additional context through files/images. Consider this information when creating the outline.'
    : '';

  const thinkingHint = options?.enableThinking
    ? '\n\nTake your time to think through the topic systematically. Consider:\n- What are the key aspects readers need to understand?\n- What makes this topic unique or challenging?\n- How can we structure this to provide maximum value?\n- What related topics should be explored?'
    : '';

  return `You are an expert content strategist for a ${websiteType}. Create a comprehensive and well-structured outline for a blog post about: "${topic}"

Requirements:
1. Generate a compelling main title that is SEO-friendly and engaging
2. Write a brief introduction (2-3 sentences) that hooks the reader
3. Create 4-6 main sections, each with:
   - A clear, descriptive title
   - A brief description of what will be covered
   ${pointsInstruction}
4. Write a conclusion that summarizes key takeaways
5. Suggest ${numOfKeywords} SEO keywords related to the topic
${searchHint}${multimodalHint}${thinkingHint}
${userCustomInstructions ? `\nAdditional Instructions: ${userCustomInstructions}\n` : ''}
Respond in JSON format with this exact structure:
{
  "main_title": "string",
  "introduction": "string",
  "sections": [
    {
      "title": "string",
      "description": "string",
      "points": ["string", "string", ...]
    }
  ],
  "conclusion": "string",
  "search_terms": ["keyword1", "keyword2", ...]
}

Make the content informative, engaging, and valuable for readers.`;
}

// ============================================================================
// Content Generation Prompts
// ============================================================================

export function buildContentPrompt(
  topic: string,
  outline: ContentOutline,
  searchTerms: string,
  includeImages: boolean,
  userCustomInstructions: string,
  websiteType: string = 'blog',
  options?: {
    useSearch?: boolean;
    useCodeExecution?: boolean;
    hasFiles?: boolean;
    hasImages?: boolean;
    enableThinking?: boolean;
  }
): string {
  const imageInstruction = includeImages
    ? '\n- Include image placeholders in markdown format: ![Image description](placeholder)'
    : '';

  const searchHint = options?.useSearch
    ? '\n\nNote: You have access to Google Search. Use it to:\n- Verify statistics and facts\n- Find authoritative sources and citations\n- Gather recent examples and case studies\n- Ensure content accuracy and relevance'
    : '';

  const codeExecutionHint = options?.useCodeExecution
    ? '\n\nNote: You can execute code to generate examples, verify logic, or perform calculations. Use this capability when demonstrating concepts or validating technical information.'
    : '';

  const multimodalHint = (options?.hasFiles || options?.hasImages)
    ? '\n\nNote: The user has provided additional context through files/images. Reference and incorporate this information naturally in the content.'
    : '';

  const thinkingHint = options?.enableThinking
    ? '\n\nTake your time to think deeply about:\n- How to best explain complex concepts\n- What examples will resonate with readers\n- How to structure information for clarity\n- What connections to make between ideas\n- How to balance depth with accessibility'
    : '';

  return `You are an expert content writer for a ${websiteType}. Write a complete, high-quality blog post based on the following outline.

Topic: ${topic}

Outline:
${JSON.stringify(outline, null, 2)}

SEO Keywords to naturally incorporate: ${searchTerms}

Requirements:
1. Write in markdown format
2. Use proper heading hierarchy (## for main sections, ### for subsections)
3. Write engaging, informative, and well-researched content
4. Include code examples if relevant to the topic (use proper code blocks with language specification)
5. Add relevant internal linking suggestions where appropriate
6. Use bullet points and numbered lists for better readability
7. Keep paragraphs concise and scannable
8. Naturally incorporate the SEO keywords without keyword stuffing${imageInstruction}
9. Write in a professional yet conversational tone
10. Ensure content is original and provides real value to readers
11. Add a compelling call-to-action or next steps in the conclusion
12. Include citations and sources when making factual claims${searchHint}${codeExecutionHint}${multimodalHint}${thinkingHint}
${userCustomInstructions ? `\nAdditional Instructions: ${userCustomInstructions}\n` : ''}
Write the complete blog post now:`;
}

// ============================================================================
// Metadata Generation Prompts
// ============================================================================

export function buildMetadataPrompt(
  topic: string,
  content: string,
  oldTags: string[],
  oldCategories: string[]
): string {
  const tagsSection = oldTags.length > 0
    ? `\nExisting tags to consider: ${oldTags.join(', ')}`
    : '';
  const categoriesSection = oldCategories.length > 0
    ? `\nExisting categories to consider: ${oldCategories.join(', ')}`
    : '';

  return `Analyze the following blog post and generate appropriate metadata.

Topic: ${topic}

Content Preview:
${content.substring(0, 2000)}...
${tagsSection}${categoriesSection}

Generate the following metadata in JSON format:
{
  "title": "SEO-optimized title (50-60 characters)",
  "excerpt": "Compelling meta description (120-160 characters)",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "main_category": "primary category"
}

Requirements:
1. Title should be engaging, SEO-friendly, and accurately represent the content
2. Excerpt should entice readers to click while summarizing the main value
3. Generate 5-7 relevant tags${oldTags.length > 0 ? ', preferring existing tags when appropriate' : ''}
4. Choose one main category${oldCategories.length > 0 ? ', preferring existing categories when appropriate' : ''}
5. All metadata should be professional and appropriate for a blog

Respond ONLY with valid JSON.`;
}

// ============================================================================
// Multi-modal Content Prompts
// ============================================================================

export function buildFileContextPrompt(fileContent: string, fileName: string): string {
  return `\n\nAdditional Context from "${fileName}":\n${fileContent}\n\nPlease incorporate relevant information from this file into the content where appropriate.`;
}

export function buildImageContextPrompt(imageDescription: string): string {
  return `\n\nImage Context: ${imageDescription}\n\nConsider this visual information when generating content.`;
}

// ============================================================================
// Image Generation Prompts
// ============================================================================

export function buildCoverImagePrompt(
  topic: string,
  content: string,
  style: string = 'modern and professional'
): string {
  return `Create a compelling blog post cover image for the following topic:

Topic: "${topic}"

Content Summary:
${content.substring(0, 500)}...

Style: ${style}

Requirements:
- Eye-catching and professional
- Relevant to the topic
- Suitable for a blog thumbnail
- High quality and visually appealing
- No text overlays needed (will be added later)`;
}

// ============================================================================
// Chat and Assistant Prompts
// ============================================================================

export function buildChatSystemPrompt(
  role: 'editor' | 'admin' | 'general',
  context?: string
): string {
  const roleInstructions = {
    editor: `You are an AI assistant helping content editors create, refine, and optimize blog posts. You have expertise in:
- Content strategy and SEO optimization
- Writing engaging and informative articles
- Structuring content for readability
- Generating metadata and tags
- Suggesting improvements and edits`,

    admin: `You are an AI assistant helping administrators manage and optimize the blog platform. You have expertise in:
- Content management and organization
- SEO and analytics insights
- User engagement strategies
- Technical recommendations
- Platform optimization`,

    general: `You are a helpful AI assistant for blog content creation and management. You provide:
- Writing assistance and suggestions
- SEO recommendations
- Content ideas and outlines
- General blogging advice
- Technical guidance`
  };

  const contextSection = context
    ? `\n\nCurrent Context:\n${context}`
    : '';

  return `${roleInstructions[role]}

Guidelines:
- Be concise and actionable
- Provide specific suggestions
- Use examples when helpful
- Consider SEO best practices
- Maintain a professional yet friendly tone${contextSection}`;
}

// ============================================================================
// Function Calling Prompts
// ============================================================================

export function buildToolUsePrompt(availableTools: string[]): string {
  return `\n\nAvailable Tools: ${availableTools.join(', ')}
  
You can use these tools to enhance your response. Use tools when:
- You need to search for current information (use search_web)
- You need to perform calculations (use code_execution)
- You need to verify facts (use search_web)
- You need to access external resources (use appropriate tool)

Think about which tools would help provide the most accurate and helpful response.`;
}

// ============================================================================
// Thinking Prompts
// ============================================================================

export function buildThinkingGuidance(taskComplexity: 'simple' | 'moderate' | 'complex'): string {
  const guidance = {
    simple: 'Take a moment to organize your thoughts before responding.',

    moderate: `Think through this systematically:
1. What information do you need?
2. How should you structure your response?
3. What are the key points to cover?`,

    complex: `Approach this thoughtfully:
1. Break down the problem into components
2. Consider multiple perspectives
3. Evaluate trade-offs and alternatives
4. Think about edge cases and implications
5. Structure your reasoning clearly
6. Validate your conclusions

Take your time to think deeply before responding.`
  };

  return `\n\n${guidance[taskComplexity]}`;
}

// ============================================================================
// Validation and Error Prompts
// ============================================================================

export function buildValidationPrompt(content: string, criteria: string[]): string {
  return `Review the following content and validate it against these criteria:

${criteria.map((c, i) => `${i + 1}. ${c}`).join('\n')}

Content:
${content}

Provide feedback in JSON format:
{
  "valid": boolean,
  "issues": ["issue1", "issue2", ...],
  "suggestions": ["suggestion1", "suggestion2", ...]
}`;
}

// ============================================================================
// Helper Functions
// ============================================================================

export function enhancePromptWithOptions(
  basePrompt: string,
  options: {
    temperature?: number;
    style?: string;
    tone?: string;
    audience?: string;
    additionalContext?: string;
  }
): string {
  let enhanced = basePrompt;

  if (options.style) {
    enhanced += `\n\nStyle: ${options.style}`;
  }

  if (options.tone) {
    enhanced += `\nTone: ${options.tone}`;
  }

  if (options.audience) {
    enhanced += `\nTarget Audience: ${options.audience}`;
  }

  if (options.additionalContext) {
    enhanced += `\n\nAdditional Context:\n${options.additionalContext}`;
  }

  return enhanced;
}

export function buildMultiModalPrompt(
  textPrompt: string,
  hasImages: boolean,
  hasFiles: boolean,
  hasAudio: boolean,
  hasVideo: boolean
): string {
  const mediaInstructions: string[] = [];

  if (hasImages) {
    mediaInstructions.push('- Analyze any provided images and reference them in your response');
  }

  if (hasFiles) {
    mediaInstructions.push('- Review any attached files and incorporate relevant information');
  }

  if (hasAudio) {
    mediaInstructions.push('- Consider any audio content provided and reference key points');
  }

  if (hasVideo) {
    mediaInstructions.push('- Analyze any video content and discuss relevant aspects');
  }

  if (mediaInstructions.length === 0) {
    return textPrompt;
  }

  return `${textPrompt}

Multi-modal Instructions:
${mediaInstructions.join('\n')}

Integrate all provided media naturally into your response.`;
}