// Type definitions for AI content generation

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

export interface GenerateOutlineRequest {
  topic: string;
  num_of_terms?: number;
  num_of_keywords?: number;
  user_custom_instructions?: string;
  num_of_points?: number | null;
  website_type?: string;
  files?: string[];
}

export interface GenerateOutlineResponse {
  outline: ContentOutline;
  search_terms?: string;
}

export interface GenerateContentRequest {
  topic: string;
  outline: ContentOutline;
  search_terms?: string;
  include_images?: boolean;
  user_custom_instructions?: string;
  website_type?: string;
  files?: string[];
}

export interface GenerateContentResponse {
  content: string;
}

export interface GenerateMetadataRequest {
  topic: string;
  content: string;
  old_tags: string[];
  old_categories: string[];
}

export interface GenerateMetadataResponse {
  title: string;
  excerpt: string;
  tags: string[];
  main_category: string;
}
