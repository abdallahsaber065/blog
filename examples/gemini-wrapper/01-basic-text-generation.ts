/**
 * Basic Text Generation Examples
 * Demonstrates various text generation capabilities
 */

import { GeminiWrapper } from '@/lib/gemini-wrapper';

async function main() {
  // Initialize the wrapper
  const gemini = new GeminiWrapper({
    apiKey: process.env.GEMINI_API_KEY!
  });

  console.log('=== Basic Text Generation ===\n');

  // Simple text generation
  const response1 = await gemini.generate("Explain quantum computing in 2 sentences");
  console.log('Simple generation:', response1);
  console.log();

  console.log('=== Streaming Text Generation ===\n');

  // Streaming generation
  const stream = await gemini.generateStream("Write a short haiku about coding");
  console.log('Streaming haiku:');
  for await (const chunk of stream) {
    process.stdout.write(chunk);
  }
  console.log('\n');

  console.log('=== Structured JSON Output ===\n');

  // Generate structured data
  const userData = await gemini.generateJSON(
    "Extract information about Elon Musk",
    {
      type: "object",
      properties: {
        name: { type: "string" },
        companies: { type: "array", items: { type: "string" } },
        born: { type: "number" },
        nationality: { type: "string" }
      },
      required: ["name", "companies"]
    }
  );
  console.log('Structured data:', JSON.stringify(userData, null, 2));
  console.log();

  console.log('=== Advanced Generation with Config ===\n');

  // Generation with custom config
  const response2 = await gemini.text.generate({
    prompt: "Write a creative story opening",
    config: {
      temperature: 0.9,
      maxOutputTokens: 200,
      topP: 0.95,
      topK: 40,
    }
  });
  console.log('Creative story:', response2.text);
  console.log();

  console.log('=== Token Counting ===\n');

  // Count tokens
  const tokens = await gemini.countTokens("This is a test prompt for token counting");
  console.log('Token count:', tokens.totalTokens);
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}

export default main;
