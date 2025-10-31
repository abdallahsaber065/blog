# Blog Application

A modern, full-featured blog platform built with Next.js, featuring AI-powered content generation, rich text editing, and comprehensive content management.

## 🌟 Features

### Core Features
- 📝 **AI Content Generation** - Intelligent blog post creation with Google Gemini AI
- 🔐 **Authentication & Authorization** - Secure user authentication with NextAuth and role-based access control
- 📊 **Database Management** - PostgreSQL with Prisma ORM for type-safe database operations
- 🎨 **Rich Content Editing** - MDX support with advanced markdown editor
- 🏷️ **Content Organization** - Categories, tags, and advanced filtering
- 🔍 **SEO Optimized** - Meta tags, sitemaps, structured data, and dynamic sitemap generation
- 📱 **Responsive Design** - Mobile-first, fully responsive interface
- 🖼️ **Media Management** - Image upload, optimization, and library management
- 💬 **Comment System** - Built-in commenting with moderation
- 📧 **Newsletter** - Email subscription and newsletter management
- 📈 **Analytics** - Post views tracking and statistics

### AI-Powered Features
- Streaming content generation with real-time updates
- Automatic outline generation
- SEO metadata generation
- Keyword suggestions
- Multi-language support ready

### Developer Features
- TypeScript for type safety
- Modern UI with Tailwind CSS and DaisyUI
- API-first architecture with RESTful endpoints
- Comprehensive documentation
- Easy deployment to multiple platforms

## 📚 Documentation

Comprehensive documentation is available in the `/docs` directory:

- **[Development Setup Guide](./docs/DEVELOPMENT_SETUP.md)** - Complete guide to setting up your development environment
- **[Deployment Guide](./docs/DEPLOYMENT.md)** - Deploy to self-hosted servers or SaaS platforms (Vercel, Railway, Render)
- **[Architecture Documentation](./docs/ARCHITECTURE.md)** - System design, patterns, and technical decisions
- **[API Documentation](./docs/API_DOCUMENTATION.md)** - Complete API reference for all endpoints
- **[Database Schema](./docs/DATABASE_SCHEMA.md)** - Database structure and relationships
- **[Environment Variables](./docs/ENVIRONMENT_VARIABLES.md)** - Configuration reference guide
- **[AI Content Generation](./docs/AI_CONTENT_GENERATION.md)** - AI features documentation

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 13+ database
- (Optional) Google Gemini API key for AI features
- (Optional) SMTP server for email functionality

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/abdallahsaber065/blog.git
   cd blog
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and configure:
   - `DATABASE_URL` - PostgreSQL connection string
   - `NEXTAUTH_URL` - Application URL (http://localhost:3000)
   - `NEXTAUTH_SECRET` - Generate with `openssl rand -base64 32`
   - `SECRET_KEY` - Application secret key
   - `CSRF_SECRET` - CSRF protection secret
   - `GEMINI_API_KEY` - (Optional) [Get from Google AI Studio](https://makersuite.google.com/app/apikey)
   - `NEXT_PUBLIC_BASE_URL` - Public base URL

   See [Environment Variables Guide](./docs/ENVIRONMENT_VARIABLES.md) for detailed configuration.

4. **Set up database**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Create admin user**
   ```bash
   npm run create-admin
   ```
   
   Default credentials:
   - Username: `abdallahsaber065`
   - Email: `abdallahsaber065@gmail.com`
   - Password: `admin123` (⚠️ Change immediately after first login!)

6. **Start development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   
   Visit [http://localhost:3000](http://localhost:3000)

## 📖 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
npm run create-admin # Create an admin user
```

## 🏗️ Technology Stack

### Frontend
- **Next.js 16** - React framework with hybrid rendering (SSR, SSG, CSR)
- **React 19** - UI library with latest features
- **TypeScript 5.6** - Type-safe JavaScript
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **DaisyUI 4.12** - Component library for Tailwind

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Prisma 5.22** - Modern ORM for PostgreSQL
- **NextAuth.js 4.24** - Authentication library
- **Node.js 18+** - JavaScript runtime

### Database & Storage
- **PostgreSQL 13+** - Relational database
- **Prisma Migrations** - Schema versioning
- **File System** - Media storage (or cloud storage compatible)

### AI & Content
- **Google Generative AI** - Gemini 1.5 Flash model
- **MDX** - Markdown with JSX support
- **MDXEditor 3.11** - Rich text editor
- **Remark/Rehype** - Markdown processing

### Additional Libraries
- **Radix UI** - Headless UI components
- **React Icons / Lucide** - Icon libraries
- **React Hook Form** - Form management
- **date-fns** - Date manipulation
- **bcryptjs** - Password hashing
- **Sharp** - Image optimization

## 🎯 Use Cases

This application is suitable for:

- **Personal Blogs** - Share thoughts, tutorials, and experiences
- **Tech Blogs** - Write technical articles with code highlighting
- **Content Creators** - Manage and publish content efficiently
- **Small Teams** - Collaborative content creation with role-based access
- **Portfolio Websites** - Showcase writing and projects
- **Documentation Sites** - Create comprehensive documentation

## 📦 Deployment Options

### SaaS Platforms (Recommended)

#### Vercel (Easiest)
```bash
vercel
```

#### Railway
```bash
railway up
```

#### Render
Connect GitHub repository via dashboard

See the [Deployment Guide](./docs/DEPLOYMENT.md) for detailed instructions.

### Self-Hosted

- **VPS** (DigitalOcean, Linode, Vultr)
- **Cloud VMs** (AWS EC2, Google Cloud VM)
- **Docker** - Container deployment

See the [Self-Hosted Deployment Guide](./docs/DEPLOYMENT.md#self-hosted-deployment) for step-by-step instructions.

## 🔒 Security Features

- **Password Hashing** - bcrypt with 10 rounds
- **JWT Tokens** - Secure session management
- **CSRF Protection** - Cross-site request forgery prevention
- **Rate Limiting** - API request throttling
- **Input Validation** - Comprehensive data validation
- **SQL Injection Prevention** - Prisma parameterized queries
- **XSS Protection** - Content sanitization
- **Secure Headers** - Security-first HTTP headers

## 🎨 Key Features Showcase

### AI Content Generation
- Generate comprehensive blog posts from topics
- Real-time streaming content generation
- Automatic SEO metadata generation
- Keyword suggestions and optimization

### Rich Content Editor
- WYSIWYG markdown editor
- Code syntax highlighting
- Image upload and embedding
- Table support
- Math equations (KaTeX)

### Content Management
- Draft, published, and archived states
- Post scheduling
- Category and tag management
- Featured images
- Reading time calculation
- View count tracking

### User Roles
- **Reader** - Read and comment
- **Author** - Create and manage own posts
- **Moderator** - Manage all content and comments
- **Admin** - Full system access

## 🤝 Support & Community

- **Documentation** - Comprehensive guides in `/docs`
- **GitHub Issues** - Report bugs and request features
- **Email** - abdallahsaber065@gmail.com

## 📝 License

This is a personal project. All rights reserved.

## 🙏 Acknowledgments

Built with these amazing technologies:
- [Next.js](https://nextjs.org/) - React framework
- [Prisma](https://www.prisma.io/) - Database ORM
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Google Gemini](https://ai.google.dev/) - AI model
- [NextAuth.js](https://next-auth.js.org/) - Authentication

## 📈 Recent Updates

### Version 2.0 (2025)
- ✨ **Comprehensive Documentation** - Complete guides for development, deployment, and API
- 🔐 **Enhanced Security** - Updated all dependencies, fixed vulnerabilities
- 🤖 **AI Integration** - Google Gemini for content generation
- 🎨 **UI Improvements** - Modern, responsive design updates
- 📦 **Better Organization** - Improved project structure and documentation

### Version 1.0 (2024)
- 🎉 Initial release with core features
- 📝 Blog post management
- 🔐 User authentication
- 🎨 MDX support

---

**For detailed information, please refer to the documentation:**
- [📖 Development Setup](./docs/DEVELOPMENT_SETUP.md)
- [🚀 Deployment Guide](./docs/DEPLOYMENT.md)
- [🏗️ Architecture](./docs/ARCHITECTURE.md)
- [📡 API Reference](./docs/API_DOCUMENTATION.md)
- [🗄️ Database Schema](./docs/DATABASE_SCHEMA.md)
- [⚙️ Environment Variables](./docs/ENVIRONMENT_VARIABLES.md)
