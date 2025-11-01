# Gemini Wrapper Examples

This directory contains comprehensive examples demonstrating all features of the Gemini API wrapper.

## Prerequisites

1. Set your Gemini API key:
   ```bash
   export GEMINI_API_KEY="your-api-key-here"
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Examples

### 01 - Basic Text Generation
**File:** `01-basic-text-generation.ts`

Demonstrates:
- Simple text generation
- Streaming text output
- Structured JSON output
- Token counting
- Custom generation configuration

**Run:**
```bash
npx ts-node examples/gemini-wrapper/01-basic-text-generation.ts
```

---

### 02 - Chat Sessions
**File:** `02-chat-sessions.ts`

Demonstrates:
- Creating chat sessions
- Multi-turn conversations
- Chat history management
- Streaming chat responses
- Custom chat configurations

**Run:**
```bash
npx ts-node examples/gemini-wrapper/02-chat-sessions.ts
```

---

### 03 - Function Calling
**File:** `03-function-calling.ts`

Demonstrates:
- Defining function declarations
- Tool usage
- Extracting function calls
- Multi-turn conversations with tools
- Mock weather and stock APIs

**Run:**
```bash
npx ts-node examples/gemini-wrapper/03-function-calling.ts
```

---

### 04 - Embeddings & Semantic Search
**File:** `04-embeddings-search.ts`

Demonstrates:
- Generating embeddings for queries
- Batch embedding documents
- Semantic similarity search
- Cosine similarity calculations
- Different task types (RETRIEVAL, CLASSIFICATION, CLUSTERING)

**Run:**
```bash
npx ts-node examples/gemini-wrapper/04-embeddings-search.ts
```

---

### 05 - Multimodal Understanding
**File:** `05-multimodal.ts`

Demonstrates:
- Image analysis
- Multiple image comparison
- Video analysis
- Audio transcription
- Combined multimodal inputs
- Base64 image handling
- Helper methods for creating media parts

**Run:**
```bash
npx ts-node examples/gemini-wrapper/05-multimodal.ts
```

**Note:** Some features require actual image/video/audio files. Update the file paths in the example.

---

### 06 - Advanced Features
**File:** `06-advanced-features.ts`

Demonstrates:
- Context caching for cost optimization
- File upload and management
- Model information retrieval
- Thinking/reasoning mode
- Safety settings
- Cache TTL management

**Run:**
```bash
npx ts-node examples/gemini-wrapper/06-advanced-features.ts
```

---

## Running All Examples

To run all examples in sequence:

```bash
for file in examples/gemini-wrapper/*.ts; do
  echo "Running $file..."
  npx ts-node "$file"
  echo "---"
done
```

## Modifying Examples

Feel free to modify these examples to experiment with different:
- Prompts
- Configuration parameters
- Models
- Temperature and creativity settings
- Safety thresholds
- Token limits

## Common Configuration Options

### Temperature
- `0.0` - Deterministic, focused responses
- `0.7` - Balanced (default)
- `1.0+` - More creative, varied responses

### Max Output Tokens
- Controls response length
- Default varies by model
- Adjust based on your needs

### Safety Settings
Categories:
- `HARM_CATEGORY_HARASSMENT`
- `HARM_CATEGORY_HATE_SPEECH`
- `HARM_CATEGORY_SEXUALLY_EXPLICIT`
- `HARM_CATEGORY_DANGEROUS_CONTENT`

Thresholds:
- `BLOCK_NONE`
- `BLOCK_LOW_AND_ABOVE`
- `BLOCK_MEDIUM_AND_ABOVE`
- `BLOCK_ONLY_HIGH`

## Troubleshooting

### API Key Issues
If you get API key errors:
```bash
echo $GEMINI_API_KEY  # Verify it's set
export GEMINI_API_KEY="your-key"  # Set it again
```

### Rate Limiting
If you hit rate limits, add delays between requests:
```typescript
await new Promise(resolve => setTimeout(resolve, 1000));
```

### File Upload (Gemini API only)
File upload is **not available** in Vertex AI. Only use file operations when using the Gemini Developer API with an API key.

## Additional Resources

- [Gemini API Documentation](https://ai.google.dev/docs)
- [Main Wrapper README](../../lib/gemini-wrapper/README.md)
- [@google/genai Package](https://www.npmjs.com/package/@google/genai)

## Contributing

Found a bug or want to add an example? Please contribute!

1. Create a new example file
2. Follow the existing format
3. Add documentation
4. Test thoroughly
5. Submit a pull request
