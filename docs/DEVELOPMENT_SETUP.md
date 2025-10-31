# Development Setup Guide

This guide will help you set up the blog application for local development.

## Table of Contents

- [Prerequisites](#prerequisites)
- [System Requirements](#system-requirements)
- [Installation Steps](#installation-steps)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [Development Workflow](#development-workflow)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, ensure you have the following installed on your system:

### Required Software

- **Node.js**: Version 18.x or higher
  - Download from [nodejs.org](https://nodejs.org/)
  - Verify installation: `node --version`

- **npm**: Version 9.x or higher (comes with Node.js)
  - Verify installation: `npm --version`

- **PostgreSQL**: Version 13 or higher
  - Download from [postgresql.org](https://www.postgresql.org/download/)
  - Verify installation: `psql --version`

- **Git**: For version control
  - Download from [git-scm.com](https://git-scm.com/)
  - Verify installation: `git --version`

### Optional but Recommended

- **VS Code**: Recommended IDE with extensions:
  - ESLint
  - Prettier
  - Prisma
  - Tailwind CSS IntelliSense
  
- **Docker**: For containerized PostgreSQL (optional)
  - Download from [docker.com](https://www.docker.com/)

## System Requirements

### Minimum Requirements

- **RAM**: 4 GB
- **CPU**: 2 cores
- **Disk Space**: 2 GB free space
- **OS**: Windows 10/11, macOS 10.15+, Linux (Ubuntu 20.04+)

### Recommended Requirements

- **RAM**: 8 GB or more
- **CPU**: 4 cores or more
- **Disk Space**: 5 GB free space
- **SSD**: For better performance

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/abdallahsaber065/blog.git
cd blog
```

### 2. Install Dependencies

Install all required npm packages:

```bash
npm install --legacy-peer-deps
```

**Note**: The `--legacy-peer-deps` flag is required due to peer dependency conflicts between Next.js versions.

### 3. Verify Installation

Check that all packages are installed correctly:

```bash
npm list --depth=0
```

## Environment Configuration

### 1. Create Environment File

Copy the example environment file:

```bash
cp .env.example .env
```

### 2. Configure Environment Variables

Edit the `.env` file with your configuration:

```env
# Database Configuration
DATABASE_URL='postgresql://username:password@localhost:5432/blog_db'

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# Application Secrets
SECRET_KEY="your-secret-key-here"
CSRF_SECRET="your-csrf-secret-here"

# Email Configuration (Optional)
MAILGUN_USER="your-mailgun-user"
MAILGUN_PASS="your-mailgun-password"

# Google Generative AI API Key (Optional - for AI content generation)
GEMINI_API_KEY="your-gemini-api-key-here"

# Website Type
WEBSITE_TYPE="blog"

# Public Base URL
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

### 3. Generate Secrets

Generate secure secrets for authentication:

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Generate SECRET_KEY
openssl rand -base64 32

# Generate CSRF_SECRET
openssl rand -base64 32
```

### 4. Optional API Keys

#### Google Gemini API (AI Content Generation)

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to `GEMINI_API_KEY` in `.env`

#### Mailgun (Email Functionality)

1. Sign up at [Mailgun](https://www.mailgun.com/)
2. Get your SMTP credentials
3. Add them to `MAILGUN_USER` and `MAILGUN_PASS` in `.env`

## Database Setup

### Option 1: Local PostgreSQL Installation

#### 1. Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE blog_db;

# Create user (optional)
CREATE USER blog_username WITH ENCRYPTED PASSWORD 'Password123';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE blog_db TO blog_username;

# Exit psql
\q
```

#### 2. Update DATABASE_URL

```env
DATABASE_URL='postgresql://blog_username:Password123@localhost:5432/blog_db'
```

### Option 2: Docker PostgreSQL

#### 1. Create Docker Compose File

Create `docker-compose.yml` in the project root:

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    container_name: blog_postgres
    environment:
      POSTGRES_USER: blog_username
      POSTGRES_PASSWORD: Password123
      POSTGRES_DB: blog_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

#### 2. Start PostgreSQL Container

```bash
docker-compose up -d
```

### Option 3: Cloud PostgreSQL (Development)

Use a cloud PostgreSQL service:

- **Neon** (recommended for development): [neon.tech](https://neon.tech/)
- **Supabase**: [supabase.com](https://supabase.com/)
- **Railway**: [railway.app](https://railway.app/)

### Initialize Database Schema

#### 1. Generate Prisma Client

```bash
npx prisma generate
```

#### 2. Run Migrations

```bash
npx prisma migrate dev
```

This command will:
- Create all database tables
- Apply any pending migrations
- Generate the Prisma Client

#### 3. Verify Database Setup

```bash
# Open Prisma Studio to view your database
npx prisma studio
```

This opens a web interface at `http://localhost:5555` to browse your database.

### Seed Database (Optional)

If you want to add sample data:

```bash
# Create an admin user
npm run create-admin
```

This creates an admin user:
- **Username**: abdallahsaber065
- **Email**: abdallahsaber065@gmail.com
- **Password**: admin123 (change after first login!)
- **Role**: admin

## Running the Application

### Development Mode

Start the development server with hot reload:

```bash
npm run dev
```

The application will be available at:
- **URL**: http://localhost:3000
- **Prisma Studio**: http://localhost:5555 (if running)

### Production Mode (Local Testing)

Build and run the production version:

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Available Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Production server
npm start

# Lint code
npm run lint

# Create admin user
npm run create-admin

# Generate Prisma client
npm run postinstall
```

## Development Workflow

### 1. Making Changes

1. Create a new branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes

3. Test your changes:
   ```bash
   npm run dev
   ```

4. Lint your code:
   ```bash
   npm run lint
   ```

### 2. Database Changes

When modifying the database schema:

```bash
# 1. Edit prisma/schema.prisma
# 2. Create migration
npx prisma migrate dev --name description_of_changes

# 3. Generate Prisma client
npx prisma generate
```

### 3. Testing Features

#### Test Authentication
1. Visit http://localhost:3000/login
2. Use the admin credentials or sign up for a new account

#### Test Blog Creation
1. Login as admin
2. Visit http://localhost:3000/admin/posts/create
3. Create a new blog post

#### Test AI Features
1. Ensure `GEMINI_API_KEY` is set
2. Visit http://localhost:3000/admin/posts/create
3. Click "Generate Content with AI"

### 4. Debugging

#### Enable Detailed Logging

Add to `.env`:
```env
DEBUG=*
LOG_LEVEL=debug
```

#### Database Queries

View generated SQL queries:
```bash
# Add to .env
DATABASE_URL='postgresql://user:pass@localhost:5432/blog_db?sslmode=disable&pgbouncer=true&connection_limit=10&query_timeout=30&log_queries=true'
```

#### Next.js Debug Mode

```bash
NODE_OPTIONS='--inspect' npm run dev
```

Then connect Chrome DevTools to `chrome://inspect`

## Troubleshooting

### Common Issues

#### 1. Port 3000 Already in Use

```bash
# Find process using port 3000
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill the process or use a different port
PORT=3001 npm run dev
```

#### 2. Database Connection Failed

**Check if PostgreSQL is running:**
```bash
# macOS/Linux
sudo service postgresql status

# Windows
# Check Services app for PostgreSQL service
```

**Verify connection string:**
```bash
# Test connection
psql postgresql://username:password@localhost:5432/blog_db
```

**Common fixes:**
- Ensure PostgreSQL is running
- Check username and password
- Verify database exists
- Check firewall settings

#### 3. Prisma Client Errors

```bash
# Regenerate Prisma client
rm -rf node_modules/.prisma
npx prisma generate

# Reset database (CAUTION: deletes all data)
npx prisma migrate reset
```

#### 4. Module Not Found Errors

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

#### 5. Build Failures

```bash
# Clear Next.js cache
rm -rf .next

# Rebuild
npm run build
```

#### 6. TypeScript Errors

```bash
# Check TypeScript version
npx tsc --version

# Verify tsconfig.json is present
cat tsconfig.json

# Rebuild TypeScript definitions
npm run build
```

#### 7. Environment Variables Not Loading

**Verify `.env` file location:**
```bash
ls -la .env
```

**Check syntax:**
- No spaces around `=`
- No quotes unless needed
- One variable per line

**Restart development server:**
```bash
# Stop with Ctrl+C
# Start again
npm run dev
```

### Getting Help

#### Check Logs

Development logs are in the terminal where you ran `npm run dev`.

#### Prisma Studio

Use Prisma Studio to inspect database:
```bash
npx prisma studio
```

#### Reset Development Environment

Complete reset (CAUTION: deletes all data):

```bash
# 1. Stop all processes
# 2. Delete build artifacts
rm -rf .next node_modules

# 3. Reset database
npx prisma migrate reset

# 4. Reinstall dependencies
npm install --legacy-peer-deps

# 5. Start fresh
npm run dev
```

## Next Steps

After successfully setting up the development environment:

1. Read the [Architecture Documentation](./ARCHITECTURE.md) to understand the system design
2. Review the [API Documentation](./API_DOCUMENTATION.md) for endpoint details
3. Check [Deployment Guide](./DEPLOYMENT.md) for production deployment

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [NextAuth.js Documentation](https://next-auth.js.org/)
