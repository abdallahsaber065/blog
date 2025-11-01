/**
 * Text Generation Module
 * Handles all text generation capabilities including chat, structured output, and function calling
 */

import type { GeminiClient } from './client';
import type {
  TextGenerationOptions,
  StructuredOutputOptions,
  ChatOptions,
  ChatMessage,
  FunctionCallResult,
  ThinkingOptions,
  Content,
  GenerateContentResponse,
  GenerationConfig,
} from './types';

/**
 * Text Generation Manager
 */
export class TextGeneration {
  constructor(private client: GeminiClient) {}

  /**
   * Generate text content from a prompt
   * 
   * @param options - Text generation options
   * @returns Generated content response
   * 
   * @example
   * ```typescript
   * const response = await textGen.generate({
   *   prompt: "Explain quantum computing in simple terms"
   * });
   * console.log(response.text);
   * ```
   */
  async generate(options: TextGenerationOptions): Promise<GenerateContentResponse> {
    const model = options.model || this.client.getDefaultModel();
    const config = this.mergeConfig(options.config);

    const params: any = {
      model,
      contents: this.normalizeContent(options.prompt),
    };

    if (options.systemInstruction) {
      params.systemInstruction = options.systemInstruction;
    }

    if (options.tools && options.tools.length > 0) {
      params.config = {
        ...params.config,
        tools: options.tools,
      };
    }

    if (options.toolConfig) {
      params.config = {
        ...params.config,
        toolConfig: options.toolConfig,
      };
    }

    if (config && Object.keys(config).length > 0) {
      params.config = {
        ...params.config,
        ...config,
      };
    }

    if (options.safetySettings && options.safetySettings.length > 0) {
      params.config = {
        ...params.config,
        safetySettings: options.safetySettings,
      };
    }

    return await this.client.models.generateContent(params);
  }

  /**
   * Generate text content with streaming
   * 
   * @param options - Text generation options
   * @returns Async generator yielding content chunks
   * 
   * @example
   * ```typescript
   * const stream = await textGen.generateStream({
   *   prompt: "Write a short story"
   * });
   * 
   * for await (const chunk of stream) {
   *   process.stdout.write(chunk.text || '');
   * }
   * ```
   */
  async generateStream(options: TextGenerationOptions): Promise<AsyncGenerator<GenerateContentResponse>> {
    const model = options.model || this.client.getDefaultModel();
    const config = this.mergeConfig(options.config);

    const params: any = {
      model,
      contents: this.normalizeContent(options.prompt),
    };

    if (options.systemInstruction) {
      params.systemInstruction = options.systemInstruction;
    }

    if (options.tools && options.tools.length > 0) {
      params.config = {
        ...params.config,
        tools: options.tools,
      };
    }

    if (options.toolConfig) {
      params.config = {
        ...params.config,
        toolConfig: options.toolConfig,
      };
    }

    if (config && Object.keys(config).length > 0) {
      params.config = {
        ...params.config,
        ...config,
      };
    }

    if (options.safetySettings && options.safetySettings.length > 0) {
      params.config = {
        ...params.config,
        safetySettings: options.safetySettings,
      };
    }

    return await this.client.models.generateContentStream(params);
  }

  /**
   * Generate structured output in JSON format
   * 
   * @param options - Structured output options with JSON schema
   * @returns Generated content response with JSON-formatted output
   * 
   * @example
   * ```typescript
   * const response = await textGen.generateStructured({
   *   prompt: "Extract key information about Apple Inc.",
   *   schema: {
   *     type: "object",
   *     properties: {
   *       name: { type: "string" },
   *       founded: { type: "number" },
   *       products: { type: "array", items: { type: "string" } }
   *     }
   *   }
   * });
   * 
   * const data = JSON.parse(response.text);
   * ```
   */
  async generateStructured<T = any>(options: StructuredOutputOptions<T>): Promise<GenerateContentResponse> {
    const model = options.model || this.client.getDefaultModel();
    const config: GenerationConfig = {
      ...this.mergeConfig(options.config),
      responseMimeType: 'application/json',
      responseSchema: options.schema,
    };

    const params: any = {
      model,
      contents: this.normalizeContent(options.prompt),
      config,
    };

    if (options.systemInstruction) {
      params.systemInstruction = options.systemInstruction;
    }

    if (options.safetySettings && options.safetySettings.length > 0) {
      params.config = {
        ...params.config,
        safetySettings: options.safetySettings,
      };
    }

    return await this.client.models.generateContent(params);
  }

  /**
   * Generate with thinking/reasoning capabilities
   * Uses advanced prompting techniques to leverage model's reasoning
   * 
   * @param options - Thinking options
   * @returns Generated content response with reasoning
   * 
   * @example
   * ```typescript
   * const response = await textGen.generateWithThinking({
   *   prompt: "Solve this complex math problem step by step: ...",
   *   enableThinking: true
   * });
   * ```
   */
  async generateWithThinking(options: ThinkingOptions): Promise<GenerateContentResponse> {
    const model = options.model || this.client.getDefaultModel();
    const config = this.mergeConfig(options.config);

    let prompt = options.prompt;
    
    // Add thinking prompt wrapper if enabled
    if (options.enableThinking) {
      prompt = `Please think through this step by step, showing your reasoning:\n\n${prompt}`;
    }

    const params: any = {
      model,
      contents: this.normalizeContent(prompt),
    };

    if (config && Object.keys(config).length > 0) {
      params.config = config;
    }

    if (options.safetySettings && options.safetySettings.length > 0) {
      params.config = {
        ...params.config,
        safetySettings: options.safetySettings,
      };
    }

    return await this.client.models.generateContent(params);
  }

  /**
   * Extract function calls from a response
   * 
   * @param response - The generate content response
   * @returns Array of function call results
   */
  extractFunctionCalls(response: GenerateContentResponse): FunctionCallResult[] {
    const functionCalls: FunctionCallResult[] = [];

    if (response.functionCalls && response.functionCalls.length > 0) {
      for (const call of response.functionCalls) {
        functionCalls.push({
          name: call.name || '',
          args: call.args as Record<string, any>,
        });
      }
    }

    return functionCalls;
  }

  /**
   * Normalize content to the expected format
   */
  private normalizeContent(content: string | Content | Content[]): Content[] {
    if (typeof content === 'string') {
      return [{ role: 'user', parts: [{ text: content }] }];
    }
    
    if (Array.isArray(content)) {
      return content;
    }
    
    return [content];
  }

  /**
   * Merge custom config with defaults
   */
  private mergeConfig(config?: GenerationConfig): GenerationConfig {
    const defaultConfig = this.client.getConfig().defaultGenerationConfig;
    return {
      ...defaultConfig,
      ...config,
    };
  }
}

/**
 * Chat Manager for multi-turn conversations
 */
export class ChatManager {
  constructor(private client: GeminiClient) {}

  /**
   * Create a new chat session
   * 
   * @param options - Chat configuration options
   * @returns Chat session object
   * 
   * @example
   * ```typescript
   * const chat = chatManager.createChat({
   *   systemInstruction: "You are a helpful assistant"
   * });
   * 
   * const response1 = await chat.sendMessage("Hello!");
   * const response2 = await chat.sendMessage("Tell me a joke");
   * ```
   */
  createChat(options: ChatOptions = {}) {
    const model = options.model || this.client.getDefaultModel();
    const defaultConfig = this.client.getConfig().defaultGenerationConfig;
    const config = {
      ...defaultConfig,
      ...options.config,
    };

    const createParams: any = {
      model,
    };

    if (options.systemInstruction) {
      createParams.systemInstruction = options.systemInstruction;
    }

    if (options.history && options.history.length > 0) {
      createParams.history = options.history;
    }

    if (options.tools && options.tools.length > 0) {
      createParams.config = {
        ...createParams.config,
        tools: options.tools,
      };
    }

    if (options.toolConfig) {
      createParams.config = {
        ...createParams.config,
        toolConfig: options.toolConfig,
      };
    }

    if (config && Object.keys(config).length > 0) {
      createParams.config = {
        ...createParams.config,
        ...config,
      };
    }

    if (options.safetySettings && options.safetySettings.length > 0) {
      createParams.config = {
        ...createParams.config,
        safetySettings: options.safetySettings,
      };
    }

    const chat = this.client.chats.create(createParams);

    return {
      /**
       * Send a message to the chat
       */
      sendMessage: async (message: string) => {
        return await chat.sendMessage({ message });
      },

      /**
       * Send a message with streaming response
       */
      sendMessageStream: async (message: string) => {
        return await chat.sendMessageStream({ message });
      },

      /**
       * Get the chat history
       */
      getHistory: () => {
        return chat.getHistory();
      },

      /**
       * Get the underlying chat object
       */
      getRawChat: () => {
        return chat;
      },
    };
  }
}
