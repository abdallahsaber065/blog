/**
 * Core Gemini API Client Wrapper
 * Provides a comprehensive interface to Google's Gemini API
 */

import { GoogleGenAI } from '@google/genai';
import type { GeminiWrapperConfig } from './types';

/**
 * Main client class for interacting with the Gemini API
 * 
 * @example
 * ```typescript
 * const client = new GeminiClient({
 *   apiKey: process.env.GEMINI_API_KEY
 * });
 * ```
 */
export class GeminiClient {
  private client: GoogleGenAI;
  private config: Required<GeminiWrapperConfig>;

  /**
   * Creates a new Gemini client instance
   * 
   * @param config - Configuration options for the client
   */
  constructor(config: GeminiWrapperConfig) {
    // Set default configuration
    this.config = {
      apiKey: config.apiKey || process.env.GEMINI_API_KEY || '',
      vertexai: config.vertexai || false,
      project: config.project || process.env.GOOGLE_CLOUD_PROJECT || '',
      location: config.location || process.env.GOOGLE_CLOUD_LOCATION || 'us-central1',
      apiVersion: config.apiVersion || 'v1beta',
      defaultModel: config.defaultModel || 'gemini-2.0-flash-exp',
      defaultImageModel: config.defaultImageModel || 'imagen-3.0-generate-001',
      defaultGenerationConfig: config.defaultGenerationConfig || {},
      defaultSafetySettings: config.defaultSafetySettings || [],
    };

    // Validate configuration
    if (!this.config.vertexai && !this.config.apiKey) {
      throw new Error('API key is required for Gemini Developer API. Set apiKey in config or GEMINI_API_KEY environment variable.');
    }

    if (this.config.vertexai && (!this.config.project || !this.config.location)) {
      throw new Error('Project and location are required for Vertex AI. Set them in config or via environment variables.');
    }

    // Initialize the Google Gen AI client
    const clientOptions: any = {
      apiVersion: this.config.apiVersion,
    };

    if (this.config.vertexai) {
      clientOptions.vertexai = true;
      clientOptions.project = this.config.project;
      clientOptions.location = this.config.location;
    } else {
      clientOptions.apiKey = this.config.apiKey;
    }

    this.client = new GoogleGenAI(clientOptions);
  }

  /**
   * Get the underlying GoogleGenAI client instance
   * Provides direct access to the native API for advanced use cases
   * 
   * @returns The GoogleGenAI client instance
   */
  public getClient(): GoogleGenAI {
    return this.client;
  }

  /**
   * Get the current configuration
   * 
   * @returns The client configuration
   */
  public getConfig(): Required<GeminiWrapperConfig> {
    return { ...this.config };
  }

  /**
   * Check if the client is configured for Vertex AI
   * 
   * @returns True if using Vertex AI, false if using Gemini Developer API
   */
  public isVertexAI(): boolean {
    return this.config.vertexai;
  }

  /**
   * Get the default model for text generation
   * 
   * @returns The default model name
   */
  public getDefaultModel(): string {
    return this.config.defaultModel;
  }

  /**
   * Get the default model for image generation
   * 
   * @returns The default image model name
   */
  public getDefaultImageModel(): string {
    return this.config.defaultImageModel;
  }

  /**
   * Set the default model for text generation
   * 
   * @param model - The model name to set as default
   */
  public setDefaultModel(model: string): void {
    this.config.defaultModel = model;
  }

  /**
   * Set the default model for image generation
   * 
   * @param model - The model name to set as default
   */
  public setDefaultImageModel(model: string): void {
    this.config.defaultImageModel = model;
  }

  /**
   * Update the default generation configuration
   * 
   * @param config - Partial generation config to merge with existing defaults
   */
  public updateDefaultGenerationConfig(config: Partial<typeof this.config.defaultGenerationConfig>): void {
    this.config.defaultGenerationConfig = {
      ...this.config.defaultGenerationConfig,
      ...config,
    };
  }

  /**
   * Get access to the models API
   * 
   * @returns The models API instance
   */
  public get models() {
    return this.client.models;
  }

  /**
   * Get access to the files API
   * 
   * @returns The files API instance
   */
  public get files() {
    return this.client.files;
  }

  /**
   * Get access to the caches API
   * 
   * @returns The caches API instance
   */
  public get caches() {
    return this.client.caches;
  }

  /**
   * Get access to the chats API
   * 
   * @returns The chats API instance
   */
  public get chats() {
    return this.client.chats;
  }

  /**
   * Get access to the live API
   * 
   * @returns The live API instance
   */
  public get live() {
    return this.client.live;
  }

  /**
   * Get access to the batches API
   * 
   * @returns The batches API instance
   */
  public get batches() {
    return this.client.batches;
  }
}
