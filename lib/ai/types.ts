// Comprehensive type definitions for AI content generation

// ============================================================================
// Base Types
// ============================================================================

export interface OutlineSection {
  title: string;
  description: string;
  points?: string[];
}

export interface ContentOutline {
  main_title: string;
  introduction: string;
  sections: OutlineSection[];
  conclusion: string;
  search_terms?: string[];
}

// ============================================================================
// Generation Request Types
// ============================================================================

export interface GenerateOutlineRequest {
  topic: string;
  num_of_terms?: number;
  num_of_keywords?: number;
  user_custom_instructions?: string;
  num_of_points?: number | null;
  website_type?: string;
  files?: string[];
  images?: string[];
  use_search?: boolean;
  thinking_budget?: number;
}

export interface GenerateContentRequest {
  topic: string;
  outline: ContentOutline;
  search_terms?: string;
  include_images?: boolean;
  user_custom_instructions?: string;
  website_type?: string;
  files?: string[];
  images?: string[];
  use_search?: boolean;
  use_code_execution?: boolean;
  thinking_budget?: number;
}

export interface GenerateMetadataRequest {
  topic: string;
  content: string;
  old_tags: string[];
  old_categories: string[];
}

export interface GenerateImageRequest {
  prompt: string;
  reference_images?: string[];
  style?: string;
  aspect_ratio?: string;
}

// ============================================================================
// Generation Response Types
// ============================================================================

export interface GenerateOutlineResponse {
  outline: ContentOutline;
  search_terms?: string;
  thinking_summary?: string;
}

export interface GenerateContentResponse {
  content: string;
  thinking_summary?: string;
  sources?: GroundingSource[];
}

export interface GenerateMetadataResponse {
  title: string;
  excerpt: string;
  tags: string[];
  main_category: string;
}

export interface GenerateImageResponse {
  image_data: string; // base64 encoded
  mime_type: string;
  width?: number;
  height?: number;
}

// ============================================================================
// Tool and Function Calling Types
// ============================================================================

export interface FunctionDeclaration {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
}

export interface ToolConfig {
  function_declarations?: FunctionDeclaration[];
  google_search?: boolean;
  code_execution?: boolean;
  url_context?: string[];
}

export interface FunctionCall {
  name: string;
  args: Record<string, any>;
}

export interface FunctionResponse {
  name: string;
  response: any;
}

// ============================================================================
// Grounding and Search Types
// ============================================================================

export interface GroundingSource {
  uri: string;
  title: string;
}

export interface GroundingMetadata {
  webSearchQueries?: string[];
  searchEntryPoint?: {
    renderedContent: string;
  };
  groundingChunks?: Array<{
    web: GroundingSource;
  }>;
  groundingSupports?: Array<{
    segment: {
      startIndex: number;
      endIndex: number;
      text: string;
    };
    groundingChunkIndices: number[];
  }>;
}

// ============================================================================
// File and Multi-modal Types
// ============================================================================

export interface FileUploadOptions {
  file: string; // file path
  mimeType?: string;
  displayName?: string;
}

export interface UploadedFile {
  name: string;
  uri: string;
  mimeType: string;
  sizeBytes?: number;
  createTime?: string;
  expirationTime?: string;
}

export interface MultiModalContent {
  text?: string;
  fileUri?: string;
  fileData?: {
    mimeType: string;
    data: string; // base64
  };
  inlineData?: {
    mimeType: string;
    data: string; // base64
  };
}

// ============================================================================
// Thinking Types
// ============================================================================

export interface ThinkingConfig {
  thinkingBudget?: number; // -1 for dynamic, 0 to disable, or specific token count
  includeThoughts?: boolean; // Include thought summaries in response
}

export interface ThoughtSummary {
  text: string;
  isThought: boolean;
}

// ============================================================================
// Chat and Conversation Types
// ============================================================================

export interface ChatMessage {
  role: 'user' | 'model';
  parts: Array<{
    text?: string;
    fileData?: {
      mimeType: string;
      fileUri: string;
    };
    inlineData?: {
      mimeType: string;
      data: string;
    };
  }>;
}

export interface ChatSession {
  history: ChatMessage[];
  model: string;
  config?: any;
}

// ============================================================================
// Streaming Types
// ============================================================================

export interface StreamChunk {
  text?: string;
  thought?: boolean;
  done: boolean;
  error?: string;
}

export type StreamHandler = (chunk: StreamChunk) => void;

// ============================================================================
// Error Types
// ============================================================================

export interface AIError {
  message: string;
  code?: string;
  details?: any;
}

// ============================================================================
// Configuration Types
// ============================================================================

export interface GenerationConfig {
  temperature?: number;
  topP?: number;
  topK?: number;
  maxOutputTokens?: number;
  responseMimeType?: string;
  responseSchema?: any;
  stopSequences?: string[];
  candidateCount?: number;
}

export interface SafetySettings {
  category: string;
  threshold: string;
}

// ============================================================================
// MCP (Model Context Protocol) Types
// ============================================================================

export interface MCPTool {
  name: string;
  description: string;
  parameters: any;
  handler: (args: any) => Promise<any>;
}

export interface MCPContext {
  tools: MCPTool[];
  context?: Record<string, any>;
}

// ============================================================================
// Image Generation Types
// ============================================================================

export interface ImageGenerationOptions {
  model?: string;
  prompt: string;
  referenceImages?: Array<{
    uri?: string;
    data?: string;
    mimeType?: string;
  }>;
  negativePrompt?: string;
  aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
  numberOfImages?: number;
}

// ============================================================================
// URL Context Types
// ============================================================================

export interface URLContext {
  urls: string[];
  maxCharsPerUrl?: number;
}

// ============================================================================
// Code Execution Types
// ============================================================================

export interface CodeExecutionResult {
  output: string;
  outcome: 'success' | 'error';
}

// ============================================================================
// Utility Types
// ============================================================================

export type ContentPart = {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
  fileData?: {
    mimeType: string;
    fileUri: string;
  };
};

export interface GenerateContentOptions {
  model: string;
  contents: string | ContentPart[];
  config?: {
    temperature?: number;
    topP?: number;
    topK?: number;
    maxOutputTokens?: number;
    responseMimeType?: string;
    responseSchema?: any;
    thinkingConfig?: ThinkingConfig;
    tools?: any[];
    systemInstruction?: string;
  };
}
