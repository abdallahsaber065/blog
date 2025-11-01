/**
 * Chat Session Examples
 * Demonstrates multi-turn conversations
 */

import { GeminiWrapper } from '@/lib/gemini-wrapper';

async function main() {
  const gemini = new GeminiWrapper({
    apiKey: process.env.GEMINI_API_KEY!
  });

  console.log('=== Simple Chat Session ===\n');

  // Create a chat session
  const chat = gemini.chat.createChat({
    systemInstruction: "You are a helpful coding assistant specialized in TypeScript"
  });

  // First message
  const response1 = await chat.sendMessage("What is TypeScript?");
  console.log('User: What is TypeScript?');
  console.log('AI:', response1.text);
  console.log();

  // Follow-up message
  const response2 = await chat.sendMessage("Can you show me an example?");
  console.log('User: Can you show me an example?');
  console.log('AI:', response2.text);
  console.log();

  // Another follow-up
  const response3 = await chat.sendMessage("What about interfaces?");
  console.log('User: What about interfaces?');
  console.log('AI:', response3.text);
  console.log();

  // View history
  console.log('=== Chat History ===\n');
  const history = chat.getHistory();
  console.log(`Total messages in history: ${history.length}`);
  console.log();

  console.log('=== Streaming Chat ===\n');

  const chat2 = gemini.chat.createChat({
    systemInstruction: "You are a helpful assistant"
  });

  console.log('User: Tell me a joke\nAI: ');
  const streamResponse = await chat2.sendMessageStream("Tell me a joke");
  for await (const chunk of streamResponse) {
    process.stdout.write(chunk.text || '');
  }
  console.log('\n');

  console.log('=== Chat with Custom Config ===\n');

  const chat3 = gemini.chat.createChat({
    systemInstruction: "You are a creative writer",
    config: {
      temperature: 0.9,
      maxOutputTokens: 300,
    }
  });

  const response4 = await chat3.sendMessage("Write the first paragraph of a sci-fi story");
  console.log('Creative story:', response4.text);
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}

export default main;
