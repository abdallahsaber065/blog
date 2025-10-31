# Environment Variables Reference

Complete guide to all environment variables used in the blog application.

## Table of Contents

- [Overview](#overview)
- [Required Variables](#required-variables)
- [Optional Variables](#optional-variables)
- [Environment-Specific Configuration](#environment-specific-configuration)
- [Security Best Practices](#security-best-practices)
- [Troubleshooting](#troubleshooting)

## Overview

### Environment File Location

The application uses a `.env` file in the project root directory for environment configuration:

```
/home/runner/work/blog/blog/.env
```

### Loading Environment Variables

Environment variables are loaded using:
- `dotenv` package for Node.js
- `next.config.mjs` for Next.js runtime
- `dotenv-cli` for CLI commands

### Example .env File

```bash
cp .env.example .env
```

## Required Variables

These variables MUST be set for the application to function.

### Database Configuration

#### DATABASE_URL

**Description**: PostgreSQL database connection string

**Required**: Yes

**Format**:
```env
DATABASE_URL='postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE_NAME'
```

**Examples**:

Local PostgreSQL:
```env
DATABASE_URL='postgresql://blog_user:Password123@localhost:5432/blog_db'
```

Neon (cloud PostgreSQL):
```env
DATABASE_URL='postgresql://user:pass@ep-cool-darkness-123456.us-east-2.aws.neon.tech/neondb?sslmode=require'
```

Supabase:
```env
DATABASE_URL='postgresql://postgres:pass@db.projectref.supabase.co:5432/postgres'
```

Railway:
```env
DATABASE_URL='postgresql://postgres:pass@containers-us-west-1.railway.app:1234/railway'
```

**Query Parameters**:
```env
# Connection pooling
DATABASE_URL='postgresql://user:pass@host/db?connection_limit=10&pool_timeout=20'

# SSL mode
DATABASE_URL='postgresql://user:pass@host/db?sslmode=require'

# PgBouncer compatibility
DATABASE_URL='postgresql://user:pass@host/db?pgbouncer=true'
```

**Troubleshooting**:
- Ensure database is running and accessible
- Check firewall rules allow connection
- Verify username and password are correct
- Test connection: `psql $DATABASE_URL`

---

### Authentication Configuration

#### NEXTAUTH_URL

**Description**: Base URL of the application for NextAuth.js

**Required**: Yes

**Format**:
```env
NEXTAUTH_URL="https://yourdomain.com"
```

**Examples**:

Development:
```env
NEXTAUTH_URL="http://localhost:3000"
```

Production:
```env
NEXTAUTH_URL="https://blog.example.com"
```

**Notes**:
- Must include protocol (http:// or https://)
- No trailing slash
- Must match actual domain
- Used for OAuth callbacks and session management

---

#### NEXTAUTH_SECRET

**Description**: Secret key for signing and encrypting NextAuth.js JWT tokens and session cookies

**Required**: Yes

**Format**: Random string (minimum 32 characters recommended)

**Generate**:
```bash
openssl rand -base64 32
```

**Example**:
```env
NEXTAUTH_SECRET="abcdef123456789abcdef123456789abcdef123456789"
```

**Security**:
- Must be unique per environment
- Never commit to version control
- Rotate regularly (requires re-authentication of all users)
- Keep different between development and production

---

### Application Secrets

#### SECRET_KEY

**Description**: General application secret for various encryption and signing operations

**Required**: Yes

**Format**: Random string (minimum 32 characters recommended)

**Generate**:
```bash
openssl rand -base64 32
```

**Example**:
```env
SECRET_KEY="xyz789abc123def456ghi789jkl012mno345pqr678"
```

**Uses**:
- Token generation
- Data encryption
- API request signing

---

#### CSRF_SECRET

**Description**: Secret for CSRF token generation and validation

**Required**: Yes

**Format**: Random string (minimum 32 characters recommended)

**Generate**:
```bash
openssl rand -base64 32
```

**Example**:
```env
CSRF_SECRET="csrf_secret_key_here_32_chars_minimum"
```

**Security**:
- Protects against Cross-Site Request Forgery attacks
- Different from other secrets
- Rotate if compromised

---

### Public URLs

#### NEXT_PUBLIC_BASE_URL

**Description**: Public base URL of the application (accessible from client-side)

**Required**: Yes

**Format**:
```env
NEXT_PUBLIC_BASE_URL="https://yourdomain.com"
```

**Examples**:

Development:
```env
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

Production:
```env
NEXT_PUBLIC_BASE_URL="https://blog.example.com"
```

**Notes**:
- Prefixed with `NEXT_PUBLIC_` to expose to browser
- Used for sitemap generation, social sharing, and metadata
- Must match actual domain

---

## Optional Variables

These variables enable additional features but are not required for basic functionality.

### AI Features

#### GEMINI_API_KEY

**Description**: Google Gemini API key for AI content generation

**Required**: No (but required for AI features)

**Format**: API key string

**Obtain**:
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with Google account
3. Create new API key
4. Copy and paste into .env

**Example**:
```env
GEMINI_API_KEY="AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

**Features Enabled**:
- AI content outline generation
- AI blog post generation with streaming
- Automatic metadata generation
- SEO keyword suggestions

**Rate Limits**:
- Free tier: 60 requests per minute
- Check [Google AI pricing](https://ai.google.dev/pricing)

**Troubleshooting**:
- Verify API key is valid
- Check quota hasn't been exceeded
- Ensure API is enabled in Google Cloud Console

---

### Email Configuration

#### MAILGUN_USER

**Description**: Mailgun SMTP username

**Required**: No (but required for email features)

**Format**: Mailgun domain or username

**Obtain**:
1. Sign up at [Mailgun](https://www.mailgun.com/)
2. Add and verify domain
3. Get SMTP credentials from Settings > SMTP

**Example**:
```env
MAILGUN_USER="postmaster@mg.yourdomain.com"
```

---

#### MAILGUN_PASS

**Description**: Mailgun SMTP password

**Required**: No (but required for email features)

**Format**: Password string

**Example**:
```env
MAILGUN_PASS="your-mailgun-smtp-password"
```

**Features Enabled**:
- Email verification
- Password reset emails
- Contact form submissions
- Newsletter emails

**Alternative SMTP Providers**:

SendGrid:
```env
MAILGUN_USER="apikey"
MAILGUN_PASS="SG.xxxxxxxxxxxxxxxxxxxxx"
```

Gmail (not recommended for production):
```env
MAILGUN_USER="youremail@gmail.com"
MAILGUN_PASS="your-app-specific-password"
```

Amazon SES:
```env
MAILGUN_USER="your-ses-smtp-username"
MAILGUN_PASS="your-ses-smtp-password"
```

---

### Application Configuration

#### WEBSITE_TYPE

**Description**: Type of website for AI content generation context

**Required**: No

**Default**: `"blog"`

**Format**: String

**Example**:
```env
WEBSITE_TYPE="blog"
```

**Options**:
- `"blog"` - Blog website
- `"news"` - News website
- `"documentation"` - Documentation site
- `"portfolio"` - Portfolio site

**Impact**:
- Affects AI content tone and style
- Influences metadata generation
- Customizes content templates

---

#### NODE_ENV

**Description**: Node.js environment mode

**Required**: No (automatically set by hosting platforms)

**Format**: String

**Values**:
- `development` - Development mode
- `production` - Production mode
- `test` - Testing mode

**Example**:
```env
NODE_ENV="production"
```

**Effects**:

Development mode:
- Detailed error messages
- Hot reloading enabled
- Source maps included
- No caching

Production mode:
- Minified code
- Error messages hidden
- Optimized builds
- Caching enabled

---

### Build Configuration

#### BUILD_DIR

**Description**: Custom build output directory

**Required**: No

**Default**: `.next`

**Example**:
```env
BUILD_DIR=".next-custom"
```

**Use Cases**:
- Multiple build outputs
- Custom deployment pipelines
- Version-specific builds

---

## Environment-Specific Configuration

### Development Environment

**File**: `.env` or `.env.development`

```env
# Database
DATABASE_URL='postgresql://blog_user:Password123@localhost:5432/blog_db'

# URLs
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"

# Secrets (use different values in production!)
NEXTAUTH_SECRET="dev_nextauth_secret_123456789"
SECRET_KEY="dev_secret_key_123456789"
CSRF_SECRET="dev_csrf_secret_123456789"

# Optional features for testing
GEMINI_API_KEY="your_dev_api_key"
MAILGUN_USER="your_test_smtp_user"
MAILGUN_PASS="your_test_smtp_pass"

# Development settings
NODE_ENV="development"
WEBSITE_TYPE="blog"
```

---

### Production Environment

**File**: `.env.production` or platform environment variables

```env
# Database (use production database)
DATABASE_URL='postgresql://prod_user:SecurePass@prod-db.example.com:5432/blog_prod?sslmode=require'

# URLs (use actual domain)
NEXTAUTH_URL="https://blog.example.com"
NEXT_PUBLIC_BASE_URL="https://blog.example.com"

# Secrets (use strong, unique values)
NEXTAUTH_SECRET="prod_strong_secret_min_32_chars_abcdef123456"
SECRET_KEY="prod_app_secret_min_32_chars_ghijkl789012"
CSRF_SECRET="prod_csrf_secret_min_32_chars_mnopqr345678"

# Optional features
GEMINI_API_KEY="prod_gemini_api_key"
MAILGUN_USER="postmaster@mg.blog.example.com"
MAILGUN_PASS="prod_mailgun_password"

# Production settings
NODE_ENV="production"
WEBSITE_TYPE="blog"
```

---

### Testing Environment

**File**: `.env.test`

```env
# Test database (separate from development)
DATABASE_URL='postgresql://test_user:TestPass@localhost:5432/blog_test'

# Test URLs
NEXTAUTH_URL="http://localhost:3001"
NEXT_PUBLIC_BASE_URL="http://localhost:3001"

# Test secrets
NEXTAUTH_SECRET="test_nextauth_secret"
SECRET_KEY="test_secret_key"
CSRF_SECRET="test_csrf_secret"

# Disable external services in tests
GEMINI_API_KEY=""
MAILGUN_USER=""
MAILGUN_PASS=""

NODE_ENV="test"
```

---

## Security Best Practices

### 1. Never Commit Secrets

**Add to .gitignore**:
```gitignore
.env
.env.local
.env.production
.env.test
.env*.local
```

**Verify**:
```bash
git status
# Should not show .env files
```

---

### 2. Use Strong Secrets

**Minimum Requirements**:
- Length: 32 characters or more
- Randomness: Use cryptographic random generators
- Uniqueness: Different for each environment
- Complexity: Mix of letters, numbers, and symbols

**Generate Strong Secrets**:
```bash
# OpenSSL (recommended)
openssl rand -base64 32

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Python
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

---

### 3. Rotate Secrets Regularly

**Schedule**:
- Production secrets: Every 90 days
- After security incident: Immediately
- When team member leaves: Immediately

**Rotation Process**:
1. Generate new secret
2. Update in production environment
3. Deploy application
4. Verify functionality
5. Document rotation date

---

### 4. Separate Environments

**Never use**:
- Production database in development
- Development secrets in production
- Shared secrets across environments

**Use**:
- Separate databases per environment
- Unique secrets per environment
- Environment-specific .env files

---

### 5. Secure Storage

**Development**:
- Store .env file locally
- Never share via email/chat
- Use secure password manager for backup

**Production**:
- Use platform environment variables (Vercel, Railway, etc.)
- Or use secret management service (AWS Secrets Manager, HashiCorp Vault)
- Enable encryption at rest

---

### 6. Access Control

**Limit Access**:
- Only necessary team members
- Role-based access control
- Audit access logs

**Production Secrets**:
- DevOps team only
- Service accounts with minimal permissions
- Multi-factor authentication required

---

### 7. Validation

**Validate on Startup**:

Create `lib/validateEnv.ts`:
```typescript
export function validateEnv() {
  const required = [
    'DATABASE_URL',
    'NEXTAUTH_URL',
    'NEXTAUTH_SECRET',
    'SECRET_KEY',
    'CSRF_SECRET',
    'NEXT_PUBLIC_BASE_URL'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  // Validate format
  if (!process.env.DATABASE_URL.startsWith('postgresql://')) {
    throw new Error('DATABASE_URL must be a PostgreSQL connection string');
  }
  
  if (process.env.NEXTAUTH_SECRET.length < 32) {
    throw new Error('NEXTAUTH_SECRET must be at least 32 characters');
  }
}
```

Call in `pages/_app.tsx`:
```typescript
import { validateEnv } from '@/lib/validateEnv';

if (process.env.NODE_ENV === 'production') {
  validateEnv();
}
```

---

## Troubleshooting

### Environment Variables Not Loading

**Symptoms**:
- Undefined environment variables
- Connection errors
- Authentication failures

**Solutions**:

1. **Check file exists**:
   ```bash
   ls -la .env
   ```

2. **Verify file format**:
   ```bash
   cat .env
   # Should show key=value pairs
   ```

3. **Check for syntax errors**:
   - No spaces around `=`
   - Quotes for values with spaces
   - One variable per line

4. **Restart development server**:
   ```bash
   # Stop with Ctrl+C
   npm run dev
   ```

5. **Clear Next.js cache**:
   ```bash
   rm -rf .next
   npm run dev
   ```

---

### Database Connection Issues

**Error**: `Can't reach database server`

**Solutions**:

1. **Verify DATABASE_URL format**:
   ```env
   DATABASE_URL='postgresql://user:pass@host:port/database'
   ```

2. **Test connection**:
   ```bash
   psql "$DATABASE_URL"
   ```

3. **Check database is running**:
   ```bash
   sudo service postgresql status
   ```

4. **Verify credentials**:
   ```bash
   psql -U username -h hostname -d database
   ```

---

### NextAuth Errors

**Error**: `[next-auth][error][SIGNIN_OAUTH_ERROR]`

**Solutions**:

1. **Verify NEXTAUTH_URL**:
   - Matches actual domain
   - Includes protocol
   - No trailing slash

2. **Check NEXTAUTH_SECRET**:
   - At least 32 characters
   - No special characters causing issues
   - Properly quoted if contains spaces

3. **Clear cookies**:
   - Browser developer tools
   - Clear site data
   - Try incognito mode

---

### AI Features Not Working

**Error**: `AI service configuration error`

**Solutions**:

1. **Verify GEMINI_API_KEY**:
   ```bash
   echo $GEMINI_API_KEY
   ```

2. **Check API key is valid**:
   ```bash
   curl -H "x-goog-api-key: $GEMINI_API_KEY" \
     "https://generativelanguage.googleapis.com/v1/models"
   ```

3. **Verify quota**:
   - Visit [Google Cloud Console](https://console.cloud.google.com/)
   - Check API quotas and limits

---

### Email Not Sending

**Solutions**:

1. **Verify SMTP credentials**:
   ```bash
   echo $MAILGUN_USER
   echo $MAILGUN_PASS
   ```

2. **Test SMTP connection**:
   ```bash
   telnet smtp.mailgun.org 587
   ```

3. **Check Mailgun dashboard**:
   - Verify domain is verified
   - Check sending limits
   - Review logs

---

## Platform-Specific Configuration

### Vercel

Set environment variables in:
- Dashboard > Project > Settings > Environment Variables

Or via CLI:
```bash
vercel env add DATABASE_URL
vercel env add NEXTAUTH_SECRET
# ... add all variables
```

---

### Railway

Set in:
- Dashboard > Project > Variables

Or via CLI:
```bash
railway variables set DATABASE_URL="postgresql://..."
```

---

### Render

Set in:
- Dashboard > Service > Environment

---

### Docker

Use `.env` file with docker-compose:

```yaml
services:
  blog:
    env_file:
      - .env
    # or
    environment:
      - DATABASE_URL=${DATABASE_URL}
```

---

## Additional Resources

- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Prisma Connection Strings](https://www.prisma.io/docs/reference/database-reference/connection-urls)
- [NextAuth.js Configuration](https://next-auth.js.org/configuration/options)
- [Development Setup Guide](./DEVELOPMENT_SETUP.md)
- [Deployment Guide](./DEPLOYMENT.md)
