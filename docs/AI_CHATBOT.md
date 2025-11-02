# AI Chatbot Documentation

## Overview

The AI Chatbot is a comprehensive conversational interface powered by Google's Gemini 2.0 Flash model with advanced AI capabilities. It provides an intelligent assistant for blog management, content creation, and general assistance.

## Features

### Core Capabilities

- **Real-time Conversations**: Chat with an AI assistant in real-time
- **Message History**: Persistent chat history stored locally
- **Multiple Sessions**: Create and manage multiple chat conversations
- **Markdown Support**: Rich text rendering with syntax highlighting
- **Dark Mode**: Full dark mode support

### Advanced AI Features

#### 1. Thinking Mode

Extended reasoning capability for complex queries and tasks.

- **Configurable Budget**: Set thinking token budget (512-16384)
- **Dynamic Allocation**: Use -1 for automatic budget adjustment
- **Visual Indicators**: See when AI is using deep reasoning

#### 2. Google Search Integration

Real-time web search for up-to-date information.

- Access current information beyond training data
- Source attribution and links
- Fact verification

#### 3. Code Execution

Execute Python code for calculations and data analysis.

- Run mathematical computations
- Data processing and analysis
- Generate visualizations

#### 4. Blog Tools (15+ Tools)

Custom tools for blog interaction and management.

**Content Management:**

- `search_posts`: Search blog posts by query, tags, or categories
- `get_post`: Get specific post by ID or slug
- `get_posts_by_category`: Filter posts by category
- `get_posts_by_tag`: Filter posts by tag
- `get_recent_posts`: Get latest published posts
- `get_featured_posts`: Get highlighted posts
- `get_related_posts`: Find related content

**Blog Analytics:**

- `get_post_stats`: Overall blog statistics
- `get_categories`: List all categories with counts
- `get_tags`: List all tags with usage
- `analyze_content`: Content quality and SEO analysis

**Content Generation:**

- `generate_outline`: Create structured blog post outlines
- `generate_metadata`: Generate SEO metadata

**Media & Files:**

- `get_uploaded_files`: List uploaded media and documents

**Administration:**

- `search_users`: Find users (admin only)
- `get_post_permissions`: Check post permissions
- `get_site_info`: General website information

## User Interface

### Main Chat Interface

The chat interface includes:

1. **Header**: AI assistant branding with clear chat button
2. **Message Area**:
   - Scrollable message history
   - User messages (blue background)
   - AI responses (white/card background)
   - Loading indicators
   - Timestamp display
3. **Input Area**:
   - Text input field
   - Attachment button (future enhancement)
   - Voice input button (future enhancement)
   - Send button

### Sidebar

The sidebar provides:

1. **New Chat Button**: Start fresh conversations
2. **AI Status Badges**: Visual indicators for enabled features
   - Brain icon: Thinking mode
   - Search icon: Google Search
   - Code icon: Code Execution
3. **Chat History**:
   - Searchable list of conversations
   - Chat preview and timestamp
   - Message count badges
   - Delete functionality
4. **Settings Access**: Quick access to AI configuration

### Settings Panel

Comprehensive AI configuration with:

1. **Blog Tools Toggle**: Enable/disable blog API integration
2. **Thinking Mode**:
   - Enable/disable toggle
   - Budget slider (512-16384 tokens)
   - Quick preset buttons
3. **Google Search**: Toggle web search capability
4. **Code Execution**: Toggle Python execution
5. **Configuration Tips**: Helpful usage guidance

## Usage Examples

### Basic Conversation

```
User: Hello! What can you help me with?

AI: Hello! I'm your AI blog assistant. I can help you with:
- Finding and searching blog posts
- Managing categories and tags
- Generating content ideas and outlines
- Providing blog statistics
- Answering questions about your blog platform
...
```

### Searching Posts

```
User: Find posts about artificial intelligence

AI: [Using search_posts tool]
I found X posts about artificial intelligence:
1. [Post Title] - Published on [Date]
   [Preview text...]
...
```

### Generating Content

```
User: Help me create a blog post outline about "The Future of Web Development"

AI: [Using generate_outline tool]
I've generated a comprehensive outline for your post:

Main Title: The Future of Web Development: Trends and Innovations

Introduction:
- Overview of current web development landscape
...
```

### Getting Analytics

```
User: Show me my blog statistics

AI: [Using get_post_stats tool]
Here are your blog statistics:
- Total Posts: 45
- Total Categories: 8
- Total Tags: 67
- Recent Activity: [details]
...
```

## Technical Architecture

### Components

1. **AIChatbot.tsx**: Main container component
   - State management for chats and messages
   - localStorage integration
   - Session authentication
   - API communication

2. **ChatInterface.tsx**: Chat display component
   - Message rendering
   - Markdown parsing
   - Syntax highlighting
   - User interactions

3. **ChatbotSidebar.tsx**: Navigation component
   - Chat list and search
   - AI status indicators
   - Settings access

4. **ChatbotSettingsPanel.tsx**: Configuration component
   - AI feature toggles
   - Parameter configuration
   - Visual feedback

### API Endpoint

**Route**: `/api/ai/chat`
**Method**: POST

**Request Body**:

```typescript
{
  messages: Array<{
    role: 'user' | 'model',
    parts: [{ text: string }]
  }>,
  useTools?: boolean,
  useThinking?: boolean,
  thinkingBudget?: number,
  useGoogleSearch?: boolean,
  useCodeExecution?: boolean
}
```

**Response**:

```typescript
{
  message: string,
  role: 'model',
  usageMetadata: {
    promptTokenCount: number,
    candidatesTokenCount: number,
    totalTokenCount: number,
    thinkingTokenCount?: number
  },
  toolCalls?: number
}
```

### Tool System

Tools are defined in `lib/ai/tools/chatbot-tools.ts`:

1. **Tool Declarations**: Function schemas using Google AI format
2. **Tool Executor**: Centralized tool execution with error handling
3. **API Integration**: Seamless connection to blog API endpoints

Tool execution flow:

1. AI detects need for tool
2. Generates function call with parameters
3. Tool executor runs appropriate API call
4. Results returned to AI
5. AI synthesizes response for user

## Data Storage

### localStorage Schema

**Chats Storage** (`chatbot-chats`):

```typescript
Array<{
  id: string,
  title: string,
  preview: string,
  timestamp: Date,
  messages: Message[],
  messageCount: number
}>
```

**Settings Storage** (`chatbot-settings`):

```typescript
{
  useThinking: boolean,
  thinkingBudget: number,
  useGoogleSearch: boolean,
  useCodeExecution: boolean,
  useTools: boolean
}
```

## Security Considerations

1. **Authentication**: Session-based auth for sensitive operations
2. **Tool Permissions**: Admin-only tools require valid credentials
3. **Rate Limiting**: API endpoints protected by rate limits
4. **Input Validation**: All user input sanitized before processing
5. **Error Handling**: Graceful error messages without exposing internals

## Performance Optimization

1. **Lazy Loading**: Components loaded on demand
2. **localStorage Caching**: Reduced server requests
3. **Message Batching**: Efficient API communication
4. **Token Management**: Configurable limits to control costs
5. **Tool Call Limits**: Maximum 5 iterations to prevent loops

## Future Enhancements

### Planned Features

1. **Voice Input/Output**: Speech-to-text and text-to-speech
2. **File Attachments**: Upload documents for AI analysis
3. **Image Analysis**: Upload and analyze images
4. **Chat Export**: Download conversation history
5. **Suggested Prompts**: Context-aware suggestions
6. **Chat Sharing**: Share conversations with team members
7. **Custom Instructions**: User-defined AI behavior
8. **Multi-language Support**: Internationalization
9. **Advanced Analytics**: Chat usage statistics
10. **Integration Hub**: Connect with external services

### Technical Improvements

1. **Streaming Responses**: Real-time message generation
2. **Server-side Storage**: Cloud-based chat persistence
3. **WebSocket Support**: Real-time bidirectional communication
4. **Caching Layer**: Redis for frequently accessed data
5. **Search Indexing**: Full-text search across all chats

## Troubleshooting

### Common Issues

**Issue**: Chat not loading

- **Solution**: Check browser console for errors, verify API endpoint is running

**Issue**: Tools not working

- **Solution**: Ensure "Blog Tools" is enabled in settings

**Issue**: Slow responses

- **Solution**: Reduce thinking budget or disable unnecessary features

**Issue**: Chat history lost

- **Solution**: localStorage may be cleared, check browser settings

**Issue**: Authentication errors

- **Solution**: Verify session is valid, try logging out and back in

## Best Practices

1. **Be Specific**: Provide clear, detailed queries for best results
2. **Use Tools**: Enable blog tools for accurate blog information
3. **Thinking Mode**: Enable for complex tasks, disable for quick questions
4. **Session Management**: Create new chats for different topics
5. **Regular Cleanup**: Delete old chats to improve performance

## API Integration Guide

### Using Chatbot Tools in Your Code

```typescript
import { executeChatbotTool } from '@/lib/ai/tools/chatbot-tools';

// Example: Search posts
const results = await executeChatbotTool(
  'search_posts',
  { query: 'AI', limit: 10 },
  sessionToken
);

// Example: Generate outline
const outline = await executeChatbotTool(
  'generate_outline',
  { 
    topic: 'Web Development Trends',
    num_of_keywords: 20
  },
  sessionToken
);
```

### Adding Custom Tools

1. Define tool schema in `chatbot-tools.ts`:

```typescript
myCustomTool: createFunctionDeclaration(
  'my_custom_tool',
  'Description of what the tool does',
  buildParameterSchema({
    param1: { type: Type.STRING, description: 'Parameter description' }
  }, ['param1'])
)
```

2. Add executor case:

```typescript
case 'my_custom_tool':
  const result = await fetch(`${baseUrl}/api/my-endpoint`, {
    method: 'POST',
    headers,
    body: JSON.stringify(args)
  });
  return await result.json();
```

## Conclusion

The AI Chatbot provides a powerful, flexible interface for interacting with your blog platform. With advanced AI capabilities and comprehensive tool integration, it serves as an intelligent assistant for content management, analytics, and creative tasks.

For additional support or feature requests, please refer to the main project documentation or open an issue on the project repository.
