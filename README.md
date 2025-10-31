This is a [Next.js](https://nextjs.org/) blog application with Prisma ORM, NextAuth authentication, MDX support, and AI-powered content generation using Google's Generative AI.

## Features

- 📝 **AI Content Generation** - Intelligent blog post creation with streaming responses
- 🔐 **Authentication** - Secure user authentication with NextAuth
- 📊 **Database** - PostgreSQL with Prisma ORM
- 🎨 **MDX Support** - Rich content editing with markdown
- 🏷️ **Categories & Tags** - Organized content management
- 🔍 **SEO Optimized** - Meta tags, sitemaps, and structured data
- 📱 **Responsive Design** - Mobile-friendly interface

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- (Optional) Google Gemini API key for AI content generation
- (Optional) SMTP server for email functionality

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` and set your configuration:
- `DATABASE_URL`: Your PostgreSQL connection string
- `NEXTAUTH_URL`: Your application URL (e.g., http://localhost:3000)
- `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
- `SECRET_KEY`: Your application secret key
- `CSRF_SECRET`: CSRF protection secret
- `GEMINI_API_KEY`: (Optional) Your Google Gemini API key for AI features - Get one from [Google AI Studio](https://makersuite.google.com/app/apikey)

### 3. Database Setup

Initialize the database schema:

```bash
npx prisma migrate dev
npx prisma generate
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run create-admin` - Create an admin user

## Recent Updates (2025)

### AI Content Generation (Latest)
- ✨ Integrated Google Generative AI (Gemini 1.5 Flash)
- 🚀 Real-time streaming content generation
- 📋 Structured outline generation with JSON output
- 🏷️ Automatic metadata generation (title, excerpt, tags, categories)
- 📝 Professional prompt engineering for high-quality content
- 🔒 Secure API endpoints with authentication
- 📚 Comprehensive documentation in `docs/AI_CONTENT_GENERATION.md`
- ✅ Zero security vulnerabilities (CodeQL verified)

### Security & Package Updates
- ✅ Updated Next.js to 14.2.33 (latest stable v14)
- ✅ Fixed 17 security vulnerabilities including:
  - Critical: Next.js SSRF and DoS vulnerabilities
  - High: axios SSRF and DoS issues
  - Moderate: nodemailer email misdelivery
- ✅ Updated nodemailer to v7 for NextAuth compatibility
- ✅ Upgraded Prisma to 5.22.0
- ✅ Updated axios to 1.13.1 with security patches

### Font Configuration
- Switched from Google Fonts to system fonts for better offline support
- Uses fallback: `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`

### Icon Updates
- Fixed react-icons compatibility (replaced deprecated `SiCsharp` with `TbBrandCSharp`)

## Tech Stack

- **Framework**: Next.js 14 (App Router + Pages Router)
- **AI**: Google Generative AI (Gemini 1.5 Flash)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS + DaisyUI
- **Content**: MDX with syntax highlighting
- **Forms**: React Hook Form
- **Icons**: React Icons

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
