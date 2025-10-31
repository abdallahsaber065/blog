# AI Content Generation Feature

This blog platform integrates Google's Generative AI (Gemini) for intelligent content generation.

## Features

### 1. Content Outline Generation
- Generate structured content outlines based on topics
- Configure number of keywords and points per section
- Add custom instructions for tailored content
- Structured JSON output for easy editing

### 2. Streaming Content Generation
- Real-time content generation with streaming responses
- Watch content appear as it's being generated
- Support for markdown formatting including code blocks
- Automatic SEO keyword integration

### 3. Metadata Generation
- Automatically generate SEO-optimized titles
- Create compelling meta descriptions
- Suggest relevant tags based on existing tags
- Assign appropriate categories

## Setup

### 1. Install Dependencies

The required packages are already installed:
- `@google/generative-ai` - Google's Generative AI SDK

### 2. Configure API Key

1. Get a Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add it to your `.env` file:

```bash
GEMINI_API_KEY="your-gemini-api-key-here"
WEBSITE_TYPE="blog"  # Optional, defaults to "blog"
```

### 3. Verify Setup

The AI features will be available in the admin panel at `/admin/posts/create` after you:
1. Set up the `GEMINI_API_KEY` environment variable
2. Have appropriate user permissions (admin, moderator, or author roles)

## Usage

### Creating Content with AI

1. Navigate to `/admin/posts/create`
2. Click "Generate Content with AI" to show the AI generator
3. Enter your topic in the topic input field
4. (Optional) Configure content settings:
   - Number of SEO keywords
   - Number of points per section
   - Custom instructions
   - Include search terms
   - Include images
5. Click "Generate Outline" to create a structured outline
6. Review and edit the outline if needed
7. Click "Generate Content" to create the full blog post
8. Watch as the content streams in real-time
9. Metadata (title, excerpt, tags, category) will be generated automatically

### Advanced Options

#### File and Image Context
- Click the file icon to attach PDF/text files for context
- Click the image icon to include reference images
- The AI will consider these when generating content

#### Content Settings
- **Number of Keywords**: Control SEO keyword density (default: 20)
- **Number of Points**: Set points per section (optional)
- **Custom Instructions**: Add specific requirements or tone preferences
- **Include Search Terms**: Generate related search terms for SEO
- **Include Images**: Add image placeholders in the content

## API Endpoints

### POST `/api/ai/generate-outline`
Generates a structured content outline.

**Request Body:**
```typescript
{
  topic: string;
  num_of_keywords?: number;
  user_custom_instructions?: string;
  num_of_points?: number | null;
  website_type?: string;
  files?: string[];
}
```

**Response:**
```typescript
{
  outline: {
    main_title: string;
    introduction: string;
    sections: Array<{
      title: string;
      description: string;
      points?: string[];
    }>;
    conclusion: string;
  };
  search_terms?: string;
}
```

### POST `/api/ai/generate-content`
Generates content with Server-Sent Events streaming.

**Request Body:**
```typescript
{
  topic: string;
  outline: ContentOutline;
  search_terms?: string;
  include_images?: boolean;
  user_custom_instructions?: string;
  website_type?: string;
  files?: string[];
}
```

**Response:** Server-Sent Events stream
```typescript
data: {"chunk": "text", "done": false}
data: {"chunk": "", "done": true, "content": "full content"}
```

### POST `/api/ai/generate-metadata`
Generates post metadata (title, excerpt, tags, category).

**Request Body:**
```typescript
{
  topic: string;
  content: string;
  old_tags: string[];
  old_categories: string[];
}
```

**Response:**
```typescript
{
  title: string;
  excerpt: string;
  tags: string[];
  main_category: string;
}
```

## Architecture

### Components

- **`lib/ai/gemini-client.ts`**: Gemini AI client configuration
- **`lib/ai/types.ts`**: TypeScript type definitions
- **`lib/ai/prompts.ts`**: Prompt templates and builders
- **`pages/api/ai/generate-outline.ts`**: Outline generation API
- **`pages/api/ai/generate-content.ts`**: Content generation API with streaming
- **`pages/api/ai/generate-metadata.ts`**: Metadata generation API
- **`components/Admin/CreatePost/AIContentGenerator.tsx`**: UI component

### Model Configuration

The system uses `gemini-1.5-flash` model with different configurations:

- **Outline Generation**: 
  - Temperature: 0.7
  - Output: JSON
  - Max tokens: 8192

- **Content Generation**:
  - Temperature: 0.8
  - Output: Text (Markdown)
  - Max tokens: 8192
  - Supports streaming

- **Metadata Generation**:
  - Temperature: 0.5
  - Output: JSON
  - Max tokens: 2048

## Security

- All AI endpoints require authentication
- Rate limiting through existing middleware
- Input validation on all requests
- Error handling prevents information leakage
- API key stored securely in environment variables

## Best Practices

1. **Topic Selection**: Be specific and clear with your topic
2. **Custom Instructions**: Add tone, style, or specific requirements
3. **Review Outlines**: Always review and edit generated outlines before content generation
4. **Edit Content**: AI-generated content should be reviewed and refined
5. **SEO Keywords**: Let the AI suggest keywords, but verify relevance
6. **Images**: Add real images to replace placeholders

## Troubleshooting

### "AI service configuration error"
- Verify `GEMINI_API_KEY` is set in `.env`
- Check API key is valid and active
- Ensure you have API quota available

### Content generation fails
- Check internet connectivity
- Verify outline structure is valid JSON
- Try simplifying custom instructions
- Check Gemini API status

### Streaming not working
- Ensure browser supports Server-Sent Events
- Check network proxy settings
- Verify authentication is valid

## Performance

- Outline generation: ~5-15 seconds
- Content generation: ~30-90 seconds (with streaming)
- Metadata generation: ~3-8 seconds

Times vary based on content complexity and API load.

## Future Enhancements

Potential improvements:
- Image generation integration
- Multi-language content support
- A/B testing for different prompt variations
- Content improvement suggestions
- Plagiarism checking integration
- Voice-to-content conversion

## Migration from External API

This implementation replaced an external backend API with integrated Next.js API routes. Benefits include:

- ✅ No external dependencies
- ✅ Reduced latency
- ✅ Better security control
- ✅ Streaming support
- ✅ Structured output
- ✅ Cost efficiency
- ✅ Easier deployment

## License

This AI integration follows the same license as the main project.
