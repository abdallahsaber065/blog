/**
 * Function Calling Examples
 * Demonstrates tool usage and function calling
 */

import { GeminiWrapper, type FunctionDeclaration, FunctionCallingConfigMode } from '@/lib/gemini-wrapper';

// Mock weather API
function getWeather(location: string, unit: string = 'celsius'): string {
  // In real app, call actual weather API
  return JSON.stringify({
    location,
    temperature: 22,
    unit,
    condition: 'Sunny',
    humidity: 65
  });
}

// Mock stock price API
function getStockPrice(symbol: string): string {
  // In real app, call actual stock API
  return JSON.stringify({
    symbol,
    price: 150.25,
    change: +2.5,
    changePercent: 1.69
  });
}

async function main() {
  const gemini = new GeminiWrapper({
    apiKey: process.env.GEMINI_API_KEY!
  });

  console.log('=== Function Calling Example ===\n');

  // Define functions
  const weatherTool: FunctionDeclaration = {
    name: "getWeather",
    description: "Get current weather for a location",
    parameters: {
      type: "object",
      properties: {
        location: {
          type: "string",
          description: "City name or location"
        },
        unit: {
          type: "string",
          enum: ["celsius", "fahrenheit"],
          description: "Temperature unit"
        }
      },
      required: ["location"]
    }
  };

  const stockTool: FunctionDeclaration = {
    name: "getStockPrice",
    description: "Get current stock price for a symbol",
    parameters: {
      type: "object",
      properties: {
        symbol: {
          type: "string",
          description: "Stock ticker symbol (e.g., AAPL, GOOGL)"
        }
      },
      required: ["symbol"]
    }
  };

  // Generate with tools
  const response = await gemini.text.generate({
    prompt: "What's the weather in London and the stock price of Apple?",
    tools: [{
      functionDeclarations: [weatherTool, stockTool]
    }],
    config: {
      toolConfig: {
        functionCallingConfig: {
          mode: FunctionCallingConfigMode.ANY
        }
      }
    }
  });

  console.log('AI Response:', response.text);
  console.log();

  // Extract function calls
  const functionCalls = gemini.text.extractFunctionCalls(response);
  console.log('Function calls requested:', functionCalls);
  console.log();

  // Execute the functions
  console.log('=== Executing Functions ===\n');
  for (const call of functionCalls) {
    console.log(`Calling ${call.name} with args:`, call.args);
    
    let result: string;
    if (call.name === 'getWeather') {
      result = getWeather(call.args.location, call.args.unit);
    } else if (call.name === 'getStockPrice') {
      result = getStockPrice(call.args.symbol);
    } else {
      result = 'Unknown function';
    }
    
    console.log(`Result:`, result);
    console.log();
  }

  console.log('=== Multi-turn with Functions ===\n');

  // For multi-turn, use chat with function calling
  const chat = gemini.chat.createChat({
    tools: [{
      functionDeclarations: [weatherTool, stockTool]
    }]
  });

  const chatResponse1 = await chat.sendMessage("What's the weather in Tokyo?");
  console.log('User: What\'s the weather in Tokyo?');
  console.log('AI:', chatResponse1.text || 'Function call requested');
  
  const calls = gemini.text.extractFunctionCalls(chatResponse1);
  if (calls.length > 0) {
    console.log('Function calls:', calls);
    // In a real app, you would execute these and send back results
  }
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}

export default main;
