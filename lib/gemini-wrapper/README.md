# Gemini API Wrapper

A comprehensive, type-safe TypeScript wrapper for the Google Gemini API using the `@google/genai` package. This wrapper provides an intuitive interface to all Gemini capabilities including text generation, image generation, multimodal understanding, embeddings, file handling, and more.

## Features

- ✅ **Text Generation** - Generate text with streaming support
- ✅ **Image Generation** - Create and edit images with Imagen models
- ✅ **Multimodal Understanding** - Analyze images, videos, and audio
- ✅ **Function Calling** - Define and use tools for external API integration
- ✅ **Structured Output** - Generate JSON with schema validation
- ✅ **Embeddings** - Generate vector embeddings for semantic search
- ✅ **File Handling** - Upload and manage large files (videos, documents)
- ✅ **Context Caching** - Cache large prompts for cost optimization
- ✅ **Chat Sessions** - Multi-turn conversations with history
- ✅ **Thinking/Reasoning** - Advanced reasoning capabilities
- ✅ **Type Safety** - Full TypeScript support with comprehensive types
- ✅ **Modular Design** - Easy to extend and customize
- ✅ **Both APIs** - Supports Gemini Developer API and Vertex AI

## Installation

The wrapper is built on top of `@google/genai`:

```bash
npm install @google/genai
```

## Quick Start

### Basic Text Generation

```typescript
import { GeminiWrapper } from '@/lib/gemini-wrapper';

const gemini = new GeminiWrapper({
  apiKey: process.env.GEMINI_API_KEY
});

// Simple generation
const text = await gemini.generate("Explain quantum computing in simple terms");
console.log(text);

// Streaming generation
for await (const chunk of await gemini.generateStream("Write a story")) {
  process.stdout.write(chunk);
}
```

### Structured Output (JSON)

```typescript
const data = await gemini.generateJSON(
  "Extract information about Apple Inc.",
  {
    type: "object",
    properties: {
      name: { type: "string" },
      founded: { type: "number" },
      ceo: { type: "string" },
      products: {
        type: "array",
        items: { type: "string" }
      }
    }
  }
);

console.log(data.name); // "Apple Inc."
console.log(data.products); // ["iPhone", "MacBook", ...]
```

### Image Generation

```typescript
const response = await gemini.image.generate({
  prompt: "A serene mountain landscape at sunset with a lake",
  numberOfImages: 2,
  aspectRatio: "16:9"
});

for (const image of response.images) {
  console.log(image.uri);
}
```

### Multimodal Understanding

```typescript
// Analyze an image
const response = await gemini.multimodal.analyzeImages(
  "Describe what you see in this image in detail",
  [imageData]
);

// Analyze a video
const videoResponse = await gemini.multimodal.analyzeVideo(
  "Summarize the key events in this video",
  videoData
);
```

### Chat Sessions

```typescript
const chat = gemini.chat.createChat({
  systemInstruction: "You are a helpful coding assistant"
});

const response1 = await chat.sendMessage("How do I create a React component?");
const response2 = await chat.sendMessage("Can you show me an example?");
const response3 = await chat.sendMessage("What about TypeScript?");

// Get conversation history
const history = chat.getHistory();
```

### Function Calling

```typescript
const weatherTool = {
  functionDeclarations: [{
    name: "getWeather",
    description: "Get weather for a location",
    parameters: {
      type: "object",
      properties: {
        location: { type: "string" },
        unit: { type: "string", enum: ["celsius", "fahrenheit"] }
      },
      required: ["location"]
    }
  }]
};

const response = await gemini.text.generate({
  prompt: "What's the weather in San Francisco?",
  tools: [weatherTool]
});

const functionCalls = gemini.text.extractFunctionCalls(response);
// Execute the functions and send results back...
```

### Embeddings

```typescript
// Generate embeddings for semantic search
const queryEmbed = await gemini.embeddings.embedQuery(
  "best practices for React hooks"
);

const docEmbed = await gemini.embeddings.embedDocument(
  "Full document text here...",
  "React Hooks Best Practices"
);

// Calculate similarity
const similarity = gemini.embeddings.cosineSimilarity(
  queryEmbed.embedding.values,
  docEmbed.embedding.values
);
```

### File Handling

```typescript
// Upload a large video file
const file = await gemini.files.uploadAndWait({
  file: "/path/to/video.mp4",
  mimeType: "video/mp4",
  displayName: "My Video"
});

// Use the file in generation
const response = await gemini.text.generate({
  prompt: "Describe what happens in this video",
  media: [gemini.files.createPartFromFile(file)]
});

// Clean up
await gemini.files.delete(file.name);
```

### Context Caching

```typescript
// Cache a large document corpus for cost savings
const cache = await gemini.cache.create({
  model: "gemini-2.0-flash-exp",
  systemInstruction: "You are a helpful assistant for the provided documents",
  contents: [
    { role: 'user', parts: [{ text: largeDocument1 }] },
    { role: 'user', parts: [{ text: largeDocument2 }] },
  ],
  ttlSeconds: 3600 // 1 hour
});

// Use the cache in generation (saves tokens/cost)
const response = await gemini.text.generate({
  prompt: "Based on the documents, answer this question...",
  config: {
    cachedContent: cache.name
  }
});
```

## Architecture

The wrapper is organized into modular components:

```
lib/gemini-wrapper/
├── index.ts              # Main entry point
├── types.ts              # TypeScript type definitions
├── client.ts             # Core client wrapper
├── text-generation.ts    # Text & chat capabilities
├── image-generation.ts   # Image generation & editing
├── multimodal.ts         # Multimodal understanding
├── embeddings.ts         # Vector embeddings
├── file-manager.ts       # File upload & management
└── cache-manager.ts      # Context caching
```

### Main Classes

- **GeminiWrapper** - Main wrapper providing unified access to all features
- **GeminiClient** - Core client managing authentication and configuration
- **TextGeneration** - Text generation with various modes
- **ChatManager** - Multi-turn conversation management
- **ImageGeneration** - Image creation and editing
- **Multimodal** - Multimodal content understanding
- **Embeddings** - Vector embedding generation
- **FileManager** - File upload and operations
- **CacheManager** - Context caching for cost optimization

## Configuration

### Gemini Developer API

```typescript
const gemini = new GeminiWrapper({
  apiKey: process.env.GEMINI_API_KEY,
  defaultModel: "gemini-2.0-flash-exp",
  defaultImageModel: "imagen-3.0-generate-001",
  apiVersion: "v1beta"
});
```

### Vertex AI

```typescript
const gemini = new GeminiWrapper({
  vertexai: true,
  project: "my-gcp-project",
  location: "us-central1",
  defaultModel: "gemini-2.0-flash-exp"
});
```

### Environment Variables

```bash
# Gemini Developer API
export GEMINI_API_KEY="your-api-key"

# Vertex AI
export GOOGLE_GENAI_USE_VERTEXAI=true
export GOOGLE_CLOUD_PROJECT="your-project"
export GOOGLE_CLOUD_LOCATION="us-central1"
```

## Advanced Usage

### Direct API Access

For advanced use cases, access the underlying Google Gen AI SDK:

```typescript
const client = gemini.getClient();
const nativeModels = client.models;

// Use native API directly
const response = await nativeModels.generateContent({
  model: "gemini-2.0-flash-exp",
  contents: "custom request"
});
```

### Custom Generation Config

```typescript
gemini.text.generate({
  prompt: "Write a poem",
  config: {
    temperature: 0.9,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 1024,
    stopSequences: ["END"]
  }
});
```

### Safety Settings

```typescript
gemini.text.generate({
  prompt: "Generate content",
  safetySettings: [
    {
      category: "HARM_CATEGORY_HARASSMENT",
      threshold: "BLOCK_MEDIUM_AND_ABOVE"
    }
  ]
});
```

## Supported Models

### Text Generation Models
- `gemini-2.0-flash-exp` (default)
- `gemini-2.0-flash-thinking-exp`
- `gemini-2.5-flash`
- `gemini-1.5-pro`
- `gemini-1.5-flash`

### Image Generation Models
- `imagen-3.0-generate-001` (default)
- `imagen-3.0-fast-generate-001`

### Embedding Models
- `text-embedding-004`
- `text-multilingual-embedding-002`

## Best Practices

1. **Use Streaming** - For better UX, stream responses for long content
2. **Cache Large Contexts** - Use context caching for repeated large prompts
3. **Batch Embeddings** - Generate embeddings in batches for efficiency
4. **Handle Files Properly** - Always wait for file processing before use
5. **Set Safety Settings** - Configure appropriate safety levels for your use case
6. **Monitor Token Usage** - Use `countTokens()` to estimate costs
7. **Use Structured Output** - For data extraction, use JSON schema validation

## Error Handling

```typescript
try {
  const response = await gemini.generate("prompt");
} catch (error) {
  if (error.message.includes('API key')) {
    console.error('Invalid API key');
  } else if (error.message.includes('quota')) {
    console.error('Quota exceeded');
  } else {
    console.error('Generation error:', error);
  }
}
```

## Migration from Old Package

If migrating from `@google/generative-ai`:

```typescript
// Old way
import { GoogleGenerativeAI } from '@google/generative-ai';
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

// New way with wrapper
import { GeminiWrapper } from '@/lib/gemini-wrapper';
const gemini = new GeminiWrapper({ apiKey });
const response = await gemini.generate("prompt");
```

## Examples

See the `/examples` directory for complete working examples:

- Text generation with streaming
- Image generation workflows
- Multimodal analysis
- Function calling implementation
- RAG with embeddings
- Context caching strategies

## API Reference

For detailed API documentation, see the inline JSDoc comments in each module or generate documentation:

```bash
npm run docs
```

## Contributing

This wrapper is designed to be extensible. To add new features:

1. Create a new module in `lib/gemini-wrapper/`
2. Add types to `types.ts`
3. Integrate with `GeminiWrapper` class in `index.ts`
4. Add tests and documentation

## License

Same as the main project.

## Credits

Built on top of [@google/genai](https://www.npmjs.com/package/@google/genai) - the official Google Gemini SDK.
