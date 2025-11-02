# AI Chatbot Feature

## Quick Start

The AI Chatbot is now available at `/chatbot` route. Access it from the navigation menu under "AI Chat".

## What is it?

A comprehensive conversational AI assistant powered by Google's Gemini 2.0 Flash model, designed specifically for blog management and content assistance.

## Key Features

- 💬 **Real-time Chat**: Instant AI responses with message history
- 🧠 **Advanced Thinking**: Deep reasoning for complex queries  
- 🔍 **Google Search**: Real-time web information
- 💻 **Code Execution**: Python code for calculations
- 🛠️ **15+ Blog Tools**: Search posts, manage content, generate outlines
- 📱 **Responsive Design**: Works on all devices
- 🌙 **Dark Mode**: Full dark mode support
- 💾 **Persistent History**: Chats saved locally

## Usage

1. **Navigate** to `/chatbot` or click "AI Chat" in the menu
2. **Start chatting** - ask about your blog, request content help, or general questions
3. **Configure** - Click settings to enable/disable AI features
4. **Manage chats** - Create multiple sessions, search history, delete old chats

## Available Tools

The chatbot can:

- Search and filter blog posts
- Get post details and analytics
- List categories and tags
- Generate content outlines
- Analyze content quality
- Access media library
- Manage users (admin)
- And much more!

## Settings

Configure AI capabilities in the settings panel:

- **Blog Tools**: Enable blog API integration (recommended)
- **Thinking Mode**: Extended reasoning (token budget: 512-16384)
- **Google Search**: Real-time web search
- **Code Execution**: Python code execution

## Documentation

For detailed documentation, see [docs/AI_CHATBOT.md](../docs/AI_CHATBOT.md)

## Examples

**Search posts:**
> "Find posts about artificial intelligence"

**Generate content:**
> "Help me create an outline for a blog post about web development trends"

**Get analytics:**
> "Show me my blog statistics"

**Content analysis:**
> "Analyze this content for SEO quality: [paste your content]"

## Technical Details

- **Frontend**: React with Next.js
- **AI Model**: Google Gemini 2.0 Flash
- **Storage**: localStorage for chat history
- **API**: REST endpoints with tool support
- **UI**: shadcn/ui components with Tailwind CSS

## Support

For issues or questions:

1. Check the [full documentation](../docs/AI_CHATBOT.md)
2. Review the [changelog](../CHANGELOG.md)
3. Open an issue in the project repository

Enjoy your new AI assistant! 🚀
