# Gemini Wrapper Integration Guide

This guide explains how the new Gemini API wrapper integrates with the existing blog application.

## Overview

The blog application has been upgraded to use the new `@google/genai` package through a comprehensive wrapper that provides:
- Full TypeScript support
- Modular architecture
- All Gemini API features
- Backward compatibility with existing code

## Migration from Old to New

### Package Changes

**Old:**
```json
"@google/generative-ai": "^0.24.1"
```

**New:**
```json
"@google/genai": "^1.28.0"
```

### Code Changes

**Old API (deprecated):**
```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });
const result = await model.generateContent(prompt);
```

**New Wrapper API:**
```typescript
import { GeminiWrapper } from '@/lib/gemini-wrapper';
const gemini = new GeminiWrapper({ apiKey });
const response = await gemini.generate(prompt);
```

## File Structure

```
lib/
├── ai/
│   ├── gemini-client.old.ts      # Backed up old implementation
│   ├── gemini-wrapper-client.ts  # Bridge to new wrapper
│   ├── prompts.ts                 # Unchanged - prompt templates
│   └── types.ts                   # Unchanged - request/response types
│
└── gemini-wrapper/               # New wrapper implementation
    ├── index.ts                  # Main export
    ├── types.ts                  # Type definitions
    ├── client.ts                 # Core client
    ├── text-generation.ts        # Text & chat
    ├── image-generation.ts       # Image capabilities
    ├── multimodal.ts             # Multimodal understanding
    ├── embeddings.ts             # Vector embeddings
    ├── file-manager.ts           # File operations
    ├── cache-manager.ts          # Caching
    └── README.md                 # Documentation

pages/api/ai/
├── generate-outline.ts           # Updated to use new wrapper
├── generate-content.ts           # Updated to use new wrapper
├── generate-metadata.ts          # Updated to use new wrapper
├── generate-outline.old.ts       # Backed up old version
├── generate-content.old.ts       # Backed up old version
└── generate-metadata.old.ts      # Backed up old version
```

## Using the Wrapper in Your Code

### Simple Usage

```typescript
import { GeminiWrapper } from '@/lib/gemini-wrapper';

const gemini = new GeminiWrapper({
  apiKey: process.env.GEMINI_API_KEY
});

// Generate text
const text = await gemini.generate("Your prompt");

// Stream text
for await (const chunk of await gemini.generateStream("Your prompt")) {
  console.log(chunk);
}

// Generate JSON
const data = await gemini.generateJSON("Extract info", schema);
```

### Using in API Routes

The existing API routes (`generate-outline.ts`, `generate-content.ts`, `generate-metadata.ts`) have been updated to use the new wrapper while maintaining the same interface:

```typescript
import { getGeminiWrapper, getConfig } from '@/lib/ai/gemini-wrapper-client';

const gemini = getGeminiWrapper();
const config = getConfig('outline');

const response = await gemini.text.generateStructured({
  prompt,
  schema,
  config
});
```

### Advanced Features

#### Chat Sessions
```typescript
const chat = gemini.chat.createChat({
  systemInstruction: "You are a helpful assistant"
});

const response = await chat.sendMessage("Hello!");
```

#### Function Calling
```typescript
const response = await gemini.text.generate({
  prompt: "What's the weather?",
  tools: [weatherTool]
});

const calls = gemini.text.extractFunctionCalls(response);
```

#### Embeddings
```typescript
const embedding = await gemini.embeddings.embedQuery("search query");
const results = gemini.embeddings.findSimilar(embedding, candidates, 5);
```

#### Image Generation
```typescript
const images = await gemini.image.generate({
  prompt: "A beautiful sunset",
  numberOfImages: 2
});
```

#### Context Caching
```typescript
const cache = await gemini.cache.create({
  model: "gemini-2.0-flash-exp",
  contents: largeContext,
  ttlSeconds: 3600
});

const response = await gemini.text.generate({
  prompt: "Question about the cached content",
  config: { cachedContent: cache.name }
});
```

## Environment Variables

No changes needed! The wrapper uses the same environment variables:

```bash
# Gemini Developer API
GEMINI_API_KEY=your-api-key

# OR for Vertex AI
GOOGLE_GENAI_USE_VERTEXAI=true
GOOGLE_CLOUD_PROJECT=your-project
GOOGLE_CLOUD_LOCATION=us-central1
```

## API Route Compatibility

The updated API routes maintain 100% backward compatibility:

### `/api/ai/generate-outline`
- Request format: unchanged
- Response format: unchanged
- Functionality: enhanced with better structured output

### `/api/ai/generate-content`
- Request format: unchanged
- Response format: unchanged (streaming SSE)
- Functionality: same streaming behavior

### `/api/ai/generate-metadata`
- Request format: unchanged
- Response format: unchanged
- Functionality: enhanced with schema validation

## New Capabilities

The wrapper unlocks many new features not previously available:

1. **Image Generation** - Create images with Imagen models
2. **Image Editing** - Edit existing images
3. **Multimodal Understanding** - Analyze images, videos, audio
4. **Vector Embeddings** - Semantic search capabilities
5. **File Management** - Upload large files for processing
6. **Context Caching** - Reduce costs for repeated prompts
7. **Function Calling** - Integrate external APIs/tools
8. **Thinking Mode** - Advanced reasoning capabilities

## Testing

Test that the migration worked:

```bash
# Check TypeScript compilation
npx tsc --noEmit --skipLibCheck

# Test the API routes
curl -X POST http://localhost:3000/api/ai/generate-outline \
  -H "Content-Type: application/json" \
  -d '{"topic": "Test topic"}'
```

## Rollback Plan

If needed, you can roll back by:

1. Restore old files:
   ```bash
   mv lib/ai/gemini-client.old.ts lib/ai/gemini-client.ts
   mv pages/api/ai/generate-outline.old.ts pages/api/ai/generate-outline.ts
   # ... repeat for other files
   ```

2. Update package.json:
   ```json
   "@google/generative-ai": "^0.24.1"
   ```

3. Reinstall:
   ```bash
   npm install --legacy-peer-deps
   ```

## Future Enhancements

The wrapper is designed for easy extension:

- Add new models as they're released
- Implement batching for multiple requests
- Add retry logic and rate limiting
- Integrate with MCP (Model Context Protocol)
- Add monitoring and logging
- Implement request caching

## Support

- **Wrapper Documentation:** [lib/gemini-wrapper/README.md](../lib/gemini-wrapper/README.md)
- **Examples:** [examples/gemini-wrapper/](../examples/gemini-wrapper/)
- **Official Docs:** https://googleapis.github.io/js-genai/

## Notes

- The old implementation files are kept as `.old.ts` for reference
- TypeScript types are fully preserved
- No breaking changes to existing functionality
- All new features are optional and additive
