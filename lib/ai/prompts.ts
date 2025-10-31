// Prompt templates for AI content generation
import { ContentOutline } from './types';

export function buildOutlinePrompt(
  topic: string,
  numOfKeywords: number,
  numOfPoints: number | null,
  userCustomInstructions: string,
  websiteType: string = 'blog'
): string {
  const pointsInstruction = numOfPoints 
    ? `Each section should contain approximately ${numOfPoints} key points.` 
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

${userCustomInstructions ? `Additional Instructions: ${userCustomInstructions}\n` : ''}
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

export function buildContentPrompt(
  topic: string,
  outline: ContentOutline,
  searchTerms: string,
  includeImages: boolean,
  userCustomInstructions: string,
  websiteType: string = 'blog'
): string {
  const imageInstruction = includeImages 
    ? '\n- Include image placeholders in markdown format: ![Image description](placeholder)'
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

${userCustomInstructions ? `Additional Instructions: ${userCustomInstructions}\n` : ''}
Write the complete blog post now:`;
}

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

export function buildFileContextPrompt(fileContent: string, fileName: string): string {
  return `\n\nAdditional Context from "${fileName}":\n${fileContent}\n\nPlease incorporate relevant information from this file into the content where appropriate.`;
}
