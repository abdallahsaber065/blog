/**
 * Advanced Features Examples
 * Demonstrates caching, file management, and other advanced features
 */

import { GeminiWrapper } from '@/lib/gemini-wrapper';

async function main() {
  const gemini = new GeminiWrapper({
    apiKey: process.env.GEMINI_API_KEY!
  });

  console.log('=== Context Caching ===\n');

  // Large document context (simulated)
  const largeDocument = `
    This is a very large document that contains important information...
    [Imagine this is thousands of lines of text]
    ... more content ...
  `.repeat(10);

  // Create a cache for the large document
  const cache = await gemini.cache.create({
    model: "gemini-2.0-flash-exp",
    systemInstruction: "You are a helpful assistant for the provided document",
    contents: gemini.cache.createContentFromText(largeDocument),
    ttlSeconds: 3600  // Cache for 1 hour
  });

  console.log('Cache created:', cache.name);
  console.log('Cache expires:', cache.expireTime);
  console.log();

  // Use the cache in generation (saves costs!)
  const response = await gemini.text.generate({
    prompt: "Summarize the key points from the document",
    config: {
      cachedContent: cache.name
    }
  });
  console.log('Response using cache:', response.text?.substring(0, 200) + '...');
  console.log();

  // Check cache status
  const cacheInfo = await gemini.cache.get(cache.name!);
  console.log('Cache is valid:', gemini.cache.isValid(cacheInfo));
  console.log('Remaining TTL:', gemini.cache.getRemainingTTL(cacheInfo), 'seconds');
  console.log();

  // Update cache TTL
  await gemini.cache.update(cache.name!, 7200);  // Extend to 2 hours
  console.log('Cache TTL updated to 2 hours');
  console.log();

  // Clean up
  await gemini.cache.delete(cache.name!);
  console.log('Cache deleted');
  console.log();

  console.log('=== File Management ===\n');

  // Note: File upload is only available in Gemini Developer API (not Vertex AI)
  if (!gemini.isVertexAI()) {
    // Upload a file
    // const file = await gemini.files.upload({
    //   file: "/path/to/document.pdf",
    //   mimeType: "application/pdf",
    //   displayName: "Important Document"
    // });
    // console.log('File uploaded:', file.name);
    // console.log('File URI:', file.uri);

    // Wait for processing
    // const readyFile = await gemini.files.waitForProcessing(file.name);
    // console.log('File ready:', readyFile.state);

    // List files
    // const fileList = await gemini.files.list(10);
    // console.log('Files in account:', fileList.files.length);

    // Use file in generation
    // const filePart = gemini.files.createPartFromFile(file);
    // const response = await gemini.text.generate({
    //   prompt: "Summarize this document",
    //   media: [filePart]
    // });

    // Delete file
    // await gemini.files.delete(file.name);

    console.log('File operations available (code commented out)');
  } else {
    console.log('File operations not available in Vertex AI');
  }
  console.log();

  console.log('=== Model Information ===\n');

  // List available models
  const models = await gemini.listModels();
  console.log('Available models:', models.models.length);
  
  // Show first few models
  for (const model of models.models.slice(0, 3)) {
    console.log(`- ${model.name}: ${model.displayName}`);
  }
  console.log();

  // Get specific model info
  const modelInfo = await gemini.getModel('gemini-2.0-flash-exp');
  console.log('Model details:');
  console.log('- Name:', modelInfo.name);
  console.log('- Display Name:', modelInfo.displayName);
  console.log('- Input Token Limit:', modelInfo.inputTokenLimit);
  console.log('- Output Token Limit:', modelInfo.outputTokenLimit);
  console.log();

  console.log('=== Thinking/Reasoning ===\n');

  // Use thinking mode for complex problems
  const thinkingResponse = await gemini.text.generateWithThinking({
    prompt: "If a snail is at the bottom of a 10-foot well and climbs 3 feet each day but slides back 2 feet each night, how many days will it take to get out?",
    enableThinking: true
  });
  console.log('Reasoning:', thinkingResponse.text);
  console.log();

  console.log('=== Safety Settings ===\n');

  // Generate with custom safety settings
  const safeResponse = await gemini.text.generate({
    prompt: "Tell me about internet security",
    safetySettings: [
      {
        category: "HARM_CATEGORY_HARASSMENT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE"
      },
      {
        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE"
      }
    ]
  });
  console.log('Safe response generated');
  console.log('Response length:', safeResponse.text?.length);
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}

export default main;
