# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Fixed - November 2, 2025 (Merge Conflict Resolution)

#### Resolved Git Merge Conflicts in AI API Routes

- **Fixed generate-content.ts**:
  - Resolved conflicts between old `gemini-wrapper-client` and new `@google/genai` client
  - Kept modern approach using `getAIClient()` and `getModelConfig()`
  - Fixed streaming implementation with `client.models.generateContentStream()`
  - Properly integrated thinking config, Google Search, and Code Execution tools

- **Fixed generate-metadata.ts**:
  - Resolved conflicts between wrapper and direct client approaches
  - Updated to use `client.models.generateContent()` with structured JSON output
  - Maintained `responseMimeType: 'application/json'` for metadata generation
  - Proper error handling for JSON parsing

- **Fixed generate-outline.ts**:
  - Resolved conflicts in outline generation API
  - Updated to use modern client with thinking budget support
  - Fixed structured JSON output with schema validation
  - Maintained enhanced features (search, files, images support)

### Fixed - November 1, 2025 (Critical API Fixes)

#### Gemini 2.5 Flash API Compatibility Fixes

- **Fixed Thinking Configuration Error**:
  - Resolved `"thinking is not supported by this model"` error for gemini-2.5-flash
  - Updated thinking config to properly disable thinking with `thinkingBudget: 0` when not needed
  - Added support for dynamic thinking with `thinkingBudget: -1`
  - Fixed default behavior: gemini-2.5-flash has thinking ENABLED by default
  - Only explicitly set thinking config when user toggles it or changes budget

- **Fixed Google Search Tool Integration**:
  - Updated from deprecated `googleSearchRetrieval` to new `googleSearch: {}` format
  - Fixed `"google_search_retrieval is not supported"` error
  - Aligned with Gemini 2.5 API specifications for search grounding
  - Search tool now works correctly with gemini-2.5-flash model

- **Fixed Function Response Format**:
  - Corrected function response structure from `{ name, response }` to `{ name, response: { result } }`
  - Fixed `"Invalid JSON payload received. Unknown name 'response'"` error
  - Function responses now properly wrapped with `result` key as per API spec
  - Tool execution results correctly formatted for model consumption

- **Fixed Tools Configuration Structure**:
  - Corrected tools array structure: each tool is separate object in array
  - Fixed function declarations: `getChatbotToolsConfig()` already returns `{ functionDeclarations: [...] }`
  - Removed double-wrapping of function declarations
  - Tools now properly organized: `[{ functionDeclarations: [...] }, { googleSearch: {} }, { codeExecution: {} }]`

### Changed - November 1, 2025

#### AI Chatbot API and UI Improvements

- **Fixed Gemini API Integration**:
  - Updated chat API to use `@google/genai` client correctly with `client.chats.create()` method
  - Fixed `sendMessage()` method to use proper `SendMessageParameters` format
  - Resolved `getGenerativeModel is not a function` error
  - Properly handle chat history and message format

- **Built-in AI Tools in Input Bar**:
  - Moved Think, Search, and Code toggles from sidebar to input bar
  - Added visual toggles with lucide-react icons (Brain, Search, Code2)
  - Made toggles more accessible and contextual to message input
  - Removed redundant badges from sidebar header
  - Real-time toggle state updates with visual feedback

- **Icon Migration**:
  - Replaced all emoji icons with lucide-react icons for consistency
  - Tools now use: FileSearch, Sparkles, TrendingUp, Tag, Search icons
  - Better visual hierarchy and professional appearance

- **Enhanced Settings Panel**:
  - Redesigned settings panel with tabbed interface (Prompts, Thinking, MCP)
  - **Prompts Tab**:
    - Custom system prompt textarea
    - Saved prompts library for quick access
    - Apply/save functionality for custom prompts
  - **Thinking Tab**:
    - Visual token budget slider (512-16384 tokens)
    - Quick preset buttons (1024, 2048, 4096, 8192, 16384, Auto)
    - Real-time budget display and adjustment
    - Usage guidelines and recommendations
  - **MCP Tab**:
    - Model Context Protocol integration preview
    - Future features documentation
    - Information about MCP capabilities

- **Component Architecture**:
  - Added `onAISettingsChange` callback to `ChatInterface`
  - Proper prop threading from `AIChatbot` to child components
  - Removed unused imports (Tooltip components, unused icons)
  - Better separation of concerns between components

#### AI Chatbot Enhancements

- **Tools Selector UI**: Added embedded tools selector in chat input
  - Wrench icon button in input area with badge showing selected tools count
  - Popover with checkboxes for tool selection
  - 6 predefined tools: Search Posts, Generate Outline, Blog Statistics, Categories, Tags, Content Analysis
  - Select/Deselect all functionality
  - Visual icons for each tool (emojis)

- **Height & Layout Fixes**:
  - Fixed chatbot page height to account for header (`h-[calc(100vh-4rem)]`)
  - Removed footer from admin/moderator pages and chatbot page
  - Conditional footer rendering based on route
  - Full-height chat experience without scroll issues

- **Access Control**:
  - Chatbot now restricted to admin, moderator, and editor roles
  - Automatic redirect to login for unauthenticated users
  - Redirect to home for users without proper permissions
  - Loading state during authentication check

- **UI Components Added**:
  - Created Popover component (`components/ui/popover.tsx`)
  - Installed `@radix-ui/react-popover` package
  - Enhanced tool selection experience with checkboxes and labels

### Added - November 1, 2025

#### AI Chatbot Feature

- **Standalone AI Chatbot Page**: Created comprehensive chatbot interface at `/chatbot`
  - Clean, modern chat interface with message history
  - Real-time conversation with AI assistant powered by Gemini 2.0 Flash
  - Persistent chat history stored in localStorage
  - Multiple chat sessions support with sidebar navigation
  - Message actions: copy, feedback (thumbs up/down)
  - Markdown rendering with syntax highlighting for code blocks
  - Responsive design optimized for mobile and desktop

- **Advanced AI Capabilities**:
  - **Thinking Mode**: Extended reasoning with configurable token budget (512-16384)
  - **Google Search**: Real-time web search integration
  - **Code Execution**: Python code execution for calculations and analysis
  - **Blog Tools**: 15+ custom tools for blog interaction:
    - Search posts by query, tags, or categories
    - Get post details and metadata
    - List and manage categories and tags
    - Generate content outlines
    - Get blog statistics and analytics
    - Analyze content quality and SEO
    - Find related posts
    - Access uploaded files and media

- **Chatbot Components** (`components/Chatbot/`):
  - `AIChatbot.tsx`: Main chatbot container with state management
  - `ChatInterface.tsx`: Chat UI with message rendering and markdown support
  - `ChatbotSidebar.tsx`: Chat history, search, and AI status indicators
  - `ChatbotSettingsPanel.tsx`: Comprehensive AI configuration panel

- **API Integration**:
  - `pages/api/ai/chat.ts`: Chat endpoint with streaming and tool support
  - `lib/ai/tools/chatbot-tools.ts`: 15+ blog-specific tool definitions
  - Tool executor for seamless API interaction
  - Session-based authentication support

- **UI Enhancements**:
  - Added chatbot link to main navigation and mobile menu
  - Installed shadcn/ui components: Avatar, ScrollArea, Separator, Tooltip
  - Installed dependencies: react-markdown, react-syntax-highlighter
  - Gradient-based modern design with dark mode support
  - Visual AI feature indicators (badges for Thinking, Search, Code)

### Changed - November 1, 2025

#### AI System Migration & Enhancement

- **Google AI SDK Migration**: Complete migration from `@google/generative-ai` to `@google/genai` v1.28.0
  - Replaced old `gemini-client.ts` with modern client architecture
  - Updated all API routes to use new client and configuration system
  - Implemented comprehensive type definitions for all AI features
  - Added support for 50+ new types covering all advanced features

- **Enhanced AI Capabilities**: Added cutting-edge AI features
  - **Thinking Mode**: Dynamic and fixed-budget thinking for complex tasks
  - **Google Search Grounding**: Real-time fact verification with source tracking
  - **Code Execution**: Python code execution for examples and calculations
  - **Function Calling**: Custom tools and blog-specific functions (search, get, list operations)
  - **Multi-modal Support**: Files API for images, audio, video, and documents
  - **URL Context**: Grounding on specific URLs with validation
  - **Image Generation**: Text-to-image and image editing capabilities
  - **Streaming**: Enhanced SSE streaming with thinking mode support

- **Modern UI Redesign**: Complete overhaul of AI Content Generator
  - Redesigned with shadcn/ui components for modern, professional look
  - Implemented tabbed interface for organized settings (Basic, AI Features, Media)
  - Added visual indicators for AI enhancement status
  - Created card-based layout with gradient headers
  - Improved mobile responsiveness and touch targets
  - Added real-time file and image preview capabilities
  - Integrated advanced AI features with intuitive toggles

### Added - November 1, 2025

#### AI Tools & Utilities

- **Tools System** (`lib/ai/tools/`):
  - `google-search.ts`: Grounding metadata parsing, source extraction, formatting
  - `code-execution.ts`: Code execution with result parsing and formatting
  - `function-calling.ts`: Schema builders, blog functions, multi-turn chat
  - `url-context.ts`: URL validation, grounding, accessibility checks

- **Utility Functions** (`lib/ai/utils/`):
  - `files.ts`: Complete Files API integration (upload, list, delete, process)
  - `images.ts`: Image generation, editing, variations, blog covers
  - `streaming.ts`: SSE support, thinking streaming, progress tracking, retry logic
  - `schema.ts`: Type-safe schemas, validation, TypeScript generation

- **Configuration System**:
  - 6 model configurations: outline, content, metadata, image, chat, pro
  - Response schemas using Type enum (OBJECT, ARRAY, STRING)
  - Thinking budgets: -1 for dynamic, specific values for fixed
  - Tool configurations for search, code execution, function calling

- **Enhanced Prompts**:
  - Multi-modal support (files, images, audio, video)
  - Tool integration hints (search, code execution, functions)
  - Thinking guidance (simple, moderate, complex)
  - Chat system prompts for editor/admin/general roles
  - Image generation prompts with style modifiers

#### API Route Enhancements

- **Updated Endpoints**:
  - `generate-outline.ts`: Added thinking, search, multi-modal support
  - `generate-content.ts`: Added tools (search, code execution), streaming with thinking
  - `generate-metadata.ts`: Updated to use new client and schemas

- **New Features in API Routes**:
  - Support for `thinking_budget` parameter
  - Support for `use_search` and `use_code_execution` flags
  - Support for `files` and `images` arrays
  - Enhanced error handling and validation

#### Documentation

- **Migration Summary**: Comprehensive documentation in `lib/ai/MIGRATION_SUMMARY.md`
  - Complete feature list and capabilities
  - Architecture overview and patterns
  - Usage examples for all major features
  - Testing checklist and next steps
  - Migration benefits and improvements

### Changed - October 31, 2025

#### Navigation & Routing Updates

- **Unified Content Discovery**: Migrated all category and tag pages to the new explore page
  - Added URL query parameter support for filtering (e.g., `/explore?category=tech`, `/explore?tag=javascript`)
  - Implemented automatic state initialization from URL parameters on page load
  - Updated all internal links to use explore page with query parameters
  - Modified blog post detail pages (`/blogs/[slug]`) to link categories/tags to explore page
  - Modified blog preview pages (`/blogs/preview/[slug]`) to link categories/tags to explore page
  - Updated "Recent Posts" view all link to point to explore page
  - Updated mobile navigation drawer to use explore page
  - Added redirects for old `/tags` and `/categories` routes to `/explore`
  - Added redirect for `/discover` to `/explore` for consistency
  - Implemented dynamic redirects for specific tag/category slugs (e.g., `/tags/javascript` → `/explore?tag=javascript`)
  - Updated all revalidation paths in API routes to use explore page
  - Modified `REVALIDATE_PATHS` constants to use `EXPLORE`, `getExploreTagPath`, and `getExploreCategoryPath`
  - Updated API routes for posts, tags, and categories to trigger explore page revalidation
  - Ensured seamless data passing between blog posts and explore page filters

### Added - October 31, 2025

#### File Management Enhancement

- **File Plugin Support**: Expanded file type support across all file plugins
  - Added support for 40+ file types including Vue, Svelte, React, GraphQL, XML, Office documents, and archives
  - Added comprehensive file icon system with color-coded icons for each file type
  - Updated `InlineFilePlugin` to support all file types (previously limited to images only)
  - Integrated file type icons from React Icons (Simple Icons, Feather Icons, and Font Awesome)
  - Unified file extension configuration across all plugins using `FILE_EXTENSIONS` constant
  - Enhanced `FileSelector` component with better file type filtering

#### UI/UX Modernization

- **Table of Contents**: Complete redesign with modern, feature-rich implementation
  - Added real-time active section highlighting based on scroll position using Intersection Observer
  - Implemented reading progress tracking with visual indicators (checkmarks for read sections)
  - Added dual progress bars: scroll progress (top) and reading progress (with percentage)
  - Created collapsible/expandable UI with smooth animations
  - Added section count display (e.g., "3/10" sections read)
  - Implemented nested heading structure with proper indentation
  - Enhanced visual hierarchy with level-specific styling (H1, H2, H3)
  - Added gradient header background for better visual appeal
  - Improved mobile responsiveness with optimized touch targets
  - Integrated book icon and modern icons throughout (Feather Icons)
  - Added smooth scroll behavior with offset compensation for fixed headers
  - Implemented empty state handling (hides when no headings present)
  - Enhanced dark mode support with backdrop blur effects
  - Added glassmorphism effects for modern aesthetic

- **Discover Page**: Brand new unified content discovery page with advanced filtering system
  - Created comprehensive content discovery hub replacing separate category/tag pages
  - Implemented multi-select filtering for both categories AND tags simultaneously
  - Added collapsible filter sidebar with glassmorphism effects (desktop) and bottom sheet (mobile)
  - Integrated real-time search across title and excerpt with debouncing
  - Added multiple sort options: Newest, Oldest, Most Viewed, and Trending
  - Implemented dual view modes (grid/list) with responsive layouts
  - Created new `BlogListCard` component for list view with excerpt display
  - Added active filter chips with individual remove functionality
  - Implemented floating action button (FAB) for mobile filter access
  - Added searchable tag pills and category checkboxes
  - Integrated results counter and "Clear All Filters" functionality
  - Enhanced empty states with contextual messaging
  - Applied smooth animations and hover effects throughout
  - Ensured full dark mode support with gradient backgrounds
  
- **Tags Page**: Complete redesign with modern hero section, sticky navigation bar, and improved search functionality
  - Added gradient background with icon badges
  - Implemented grid/list view toggle for flexible content display
  - Added real-time post count display
  - Integrated search functionality with empty state handling
  - Replaced old scrolling navigation with modern button-based tag selector
  
- **Categories Page**: Comprehensive redesign with enhanced sidebar and search capabilities
  - Added gradient hero section with category information
  - Implemented modern sidebar with searchable category list
  - Added sticky sidebar with improved navigation
  - Integrated grid/list view toggle
  - Added empty state cards with helpful messaging
  - Improved responsive design for mobile and tablet views
  
- **Admin Posts Dashboard**: Modernized table layout with improved action buttons
  - Replaced list-based layout with proper data table
  - Added responsive table with hidden columns on smaller screens
  - Improved status badge styling with better color contrast
  - Enhanced action buttons with hover states and tooltips
  - Optimized button sizing for better mobile experience
  - Added category column with badge display
  - Improved overall table spacing and readability

#### Component Enhancements

- Integrated Lucide React icons (Search, Tag, Folder, Grid3x3, LayoutList, ChevronRight)
- Added Shadcn UI components for consistent design system
- Improved dark mode support across all modernized pages
- Enhanced accessibility with proper ARIA labels and semantic HTML

### Changed - October 31, 2025

#### Upgraded to Next.js 16.0.1

- **Next.js**: Upgraded from v14.2.33 to v16.0.1
- **React**: Upgraded from v18.3.1 to v19.0.0
- **React DOM**: Upgraded from v18.3.1 to v19.0.0
- **ESLint**: Upgraded from v8.57.1 to v9.0.0
- **ESLint Config Next**: Upgraded from v14.2.33 to v16.0.0
- **TypeScript Types**: Updated @types/react and @types/react-dom to v19.0.0

#### Configuration Updates

- **TypeScript**: Changed `moduleResolution` from "node" to "bundler" for better compatibility
- **TypeScript**: Updated `jsx` from "preserve" to "react-jsx" (Next.js 16 requirement)
- **TypeScript**: Added `.next/dev/types/**/*.ts` to include paths
- **Middleware**: Renamed `middleware.ts` to `proxy.ts` (Next.js 16 requirement)
- **Middleware**: Updated function export from `middleware()` to `proxy()`
- **Next.js Config**: Added `turbopack: {}` configuration for Turbopack bundler
- **Next.js Config**: Added `cacheComponents: true` for improved performance
- **Image Imports**: Fixed image imports to use proper Next.js public directory paths (e.g., `/static/images/logo.png` instead of import statements)

#### Performance Improvements

- Turbopack is now the default bundler in development mode
- Expect up to 10x faster Fast Refresh
- Expect 2-5x faster development builds
- Enhanced routing with layout deduplication and incremental prefetching
- Component caching enabled for better performance

#### Breaking Changes

- Middleware files must be renamed to `proxy.ts/proxy.js`
- Middleware function export must be renamed to `proxy()`
- React 19 introduces breaking changes - review React 19 migration guide if needed
- TypeScript now requires `jsx: "react-jsx"` configuration
