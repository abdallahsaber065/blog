# Deployment Guide

This guide covers deploying the blog application to various environments, including self-hosted servers and SaaS platforms.

## Table of Contents

- [Deployment Overview](#deployment-overview)
- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [Self-Hosted Deployment](#self-hosted-deployment)
- [SaaS Platform Deployment](#saas-platform-deployment)
- [Environment Configuration](#environment-configuration)
- [Database Migration](#database-migration)
- [Post-Deployment Tasks](#post-deployment-tasks)
- [Monitoring and Maintenance](#monitoring-and-maintenance)

## Deployment Overview

### Deployment Options

This application can be deployed to:

1. **Self-Hosted Servers**
   - VPS (DigitalOcean, Linode, Vultr)
   - Dedicated servers
   - Cloud VMs (AWS EC2, Google Cloud VM)

2. **SaaS Platforms**
   - Vercel (recommended)
   - Railway
   - Render
   - Netlify
   - AWS Amplify

### Architecture Requirements

- **Runtime**: Node.js 18+ environment
- **Database**: PostgreSQL 13+ instance
- **Storage**: File system or cloud storage for uploads
- **Memory**: Minimum 512MB RAM
- **CPU**: 1 core minimum

## Pre-Deployment Checklist

Before deploying, ensure you have:

- [ ] Production database ready (PostgreSQL)
- [ ] Environment variables configured
- [ ] Domain name (optional but recommended)
- [ ] SSL certificate (handled automatically by most platforms)
- [ ] SMTP credentials for email (optional)
- [ ] API keys (Gemini API for AI features)
- [ ] Backup strategy planned
- [ ] Monitoring tools configured

## Self-Hosted Deployment

### Option 1: Ubuntu/Debian Server with PM2

This is a complete guide for deploying on a VPS.

#### Step 1: Server Preparation

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version
npm --version

# Install PM2 globally
sudo npm install -g pm2

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Nginx (web server)
sudo apt install -y nginx

# Install Git
sudo apt install -y git
```

#### Step 2: PostgreSQL Setup

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE blog_db;
CREATE USER blog_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE blog_db TO blog_user;
\q

# Configure PostgreSQL for remote access (if needed)
sudo nano /etc/postgresql/13/main/postgresql.conf
# Set: listen_addresses = '*'

sudo nano /etc/postgresql/13/main/pg_hba.conf
# Add: host all all 0.0.0.0/0 md5

# Restart PostgreSQL
sudo systemctl restart postgresql
```

#### Step 3: Deploy Application

```bash
# Create application directory
sudo mkdir -p /var/www/blog
sudo chown $USER:$USER /var/www/blog
cd /var/www/blog

# Clone repository
git clone https://github.com/abdallahsaber065/blog.git .

# Install dependencies
npm install --legacy-peer-deps

# Create .env file
nano .env
```

Add production environment variables:

```env
DATABASE_URL='postgresql://blog_user:your_secure_password@localhost:5432/blog_db'
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="generated-secret-key"
SECRET_KEY="generated-secret-key"
CSRF_SECRET="generated-secret-key"
GEMINI_API_KEY="your-gemini-api-key"
NEXT_PUBLIC_BASE_URL="https://yourdomain.com"
```

```bash
# Run database migrations
npx prisma migrate deploy
npx prisma generate

# Build application
npm run build

# Create admin user
npm run create-admin
```

#### Step 4: Configure PM2

Create PM2 ecosystem file:

```bash
nano ecosystem.config.js
```

Add configuration:

```javascript
module.exports = {
  apps: [{
    name: 'blog',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/blog',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/pm2/blog-error.log',
    out_file: '/var/log/pm2/blog-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
};
```

Start application:

```bash
# Create log directory
sudo mkdir -p /var/log/pm2
sudo chown $USER:$USER /var/log/pm2

# Start application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup systemd
# Run the command it outputs

# Check status
pm2 status
pm2 logs blog
```

#### Step 5: Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/blog
```

Add configuration:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration (after getting certificates)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Proxy settings
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static files
    location /_next/static {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Upload files
    location /uploads {
        alias /var/www/blog/public/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Client body size (for file uploads)
    client_max_body_size 50M;
}
```

Enable site and configure SSL:

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/blog /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Install Certbot for SSL
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Restart Nginx
sudo systemctl restart nginx
```

#### Step 6: Setup Firewall

```bash
# Enable UFW
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable

# Check status
sudo ufw status
```

### Option 2: Docker Deployment

#### Create Docker Files

**Dockerfile:**

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

**docker-compose.yml:**

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: blog_postgres
    environment:
      POSTGRES_USER: blog_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: blog_db
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped

  blog:
    build: .
    container_name: blog_app
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://blog_user:${DB_PASSWORD}@postgres:5432/blog_db
      NEXTAUTH_URL: ${NEXTAUTH_URL}
      NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}
      SECRET_KEY: ${SECRET_KEY}
      CSRF_SECRET: ${CSRF_SECRET}
      GEMINI_API_KEY: ${GEMINI_API_KEY}
      NEXT_PUBLIC_BASE_URL: ${NEXT_PUBLIC_BASE_URL}
    depends_on:
      - postgres
    restart: unless-stopped
    volumes:
      - ./public/uploads:/app/public/uploads

volumes:
  postgres_data:
```

**Deploy with Docker:**

```bash
# Build and start
docker-compose up -d

# Run migrations
docker-compose exec blog npx prisma migrate deploy

# Create admin user
docker-compose exec blog npm run create-admin

# View logs
docker-compose logs -f blog
```

## SaaS Platform Deployment

### Option 1: Vercel (Recommended)

Vercel is the easiest deployment option for Next.js applications.

#### Step 1: Prepare Database

Use a managed PostgreSQL service:

**Recommended: Neon**
1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string

**Alternative: Supabase**
1. Sign up at [supabase.com](https://supabase.com)
2. Create a new project
3. Get connection string from Settings > Database

#### Step 2: Deploy to Vercel

**Via Vercel Dashboard:**

1. Visit [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "New Project"
4. Import your repository
5. Configure build settings:
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install --legacy-peer-deps`

6. Add environment variables:

```env
DATABASE_URL=your_neon_connection_string
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=generated_secret
SECRET_KEY=generated_secret
CSRF_SECRET=generated_secret
GEMINI_API_KEY=your_gemini_key
NEXT_PUBLIC_BASE_URL=https://your-app.vercel.app
```

7. Click "Deploy"

**Via Vercel CLI:**

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Set environment variables
vercel env add DATABASE_URL
vercel env add NEXTAUTH_URL
vercel env add NEXTAUTH_SECRET
# ... add all variables

# Deploy to production
vercel --prod
```

#### Step 3: Run Database Migrations

After deployment:

```bash
# Install Vercel CLI if not already
npm i -g vercel

# Link to project
vercel link

# Run migrations
vercel exec -- npx prisma migrate deploy

# Or use Prisma Data Platform
# Visit: https://cloud.prisma.io/
```

#### Step 4: Configure Custom Domain

1. Go to Project Settings > Domains
2. Add your domain
3. Configure DNS as instructed
4. Update `NEXTAUTH_URL` and `NEXT_PUBLIC_BASE_URL`

### Option 2: Railway

Railway provides easy deployment with built-in PostgreSQL.

#### Step 1: Deploy via Railway

1. Visit [railway.app](https://railway.app)
2. Sign in with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your repository

#### Step 2: Add PostgreSQL

1. Click "New" > "Database" > "PostgreSQL"
2. Railway automatically creates database
3. Copy the `DATABASE_URL` from PostgreSQL service

#### Step 3: Configure Environment Variables

In your app service, add variables:

```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
NEXTAUTH_URL=${{RAILWAY_PUBLIC_DOMAIN}}
NEXTAUTH_SECRET=generated_secret
SECRET_KEY=generated_secret
CSRF_SECRET=generated_secret
GEMINI_API_KEY=your_gemini_key
NEXT_PUBLIC_BASE_URL=${{RAILWAY_PUBLIC_DOMAIN}}
```

#### Step 4: Configure Build

Add to `package.json`:

```json
{
  "scripts": {
    "railway:build": "npm install --legacy-peer-deps && npx prisma migrate deploy && npm run build"
  }
}
```

In Railway settings:
- **Build Command**: `npm run railway:build`
- **Start Command**: `npm start`

### Option 3: Render

#### Step 1: Create Web Service

1. Visit [render.com](https://render.com)
2. Sign in with GitHub
3. Click "New" > "Web Service"
4. Connect your repository

#### Step 2: Configure Service

- **Name**: blog
- **Environment**: Node
- **Region**: Choose closest to users
- **Branch**: main
- **Build Command**: `npm install --legacy-peer-deps && npx prisma migrate deploy && npm run build`
- **Start Command**: `npm start`
- **Instance Type**: Starter (or higher)

#### Step 3: Add PostgreSQL

1. Click "New" > "PostgreSQL"
2. Choose a name and region
3. Copy the connection string

#### Step 4: Environment Variables

Add in service settings:

```env
DATABASE_URL=postgres_connection_string
NEXTAUTH_URL=https://your-app.onrender.com
NEXTAUTH_SECRET=generated_secret
SECRET_KEY=generated_secret
CSRF_SECRET=generated_secret
GEMINI_API_KEY=your_gemini_key
NEXT_PUBLIC_BASE_URL=https://your-app.onrender.com
```

### Option 4: AWS Amplify

#### Step 1: Setup Amplify

```bash
# Install Amplify CLI
npm install -g @aws-amplify/cli

# Configure
amplify configure

# Initialize
amplify init
```

#### Step 2: Create Build Spec

Create `amplify.yml`:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm install --legacy-peer-deps
        - npx prisma generate
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

#### Step 3: Deploy

```bash
amplify publish
```

## Environment Configuration

### Production Environment Variables

Essential variables for production:

```env
# Database (Required)
DATABASE_URL='postgresql://user:password@host:5432/database'

# Authentication (Required)
NEXTAUTH_URL='https://yourdomain.com'
NEXTAUTH_SECRET='long-random-secret-at-least-32-chars'

# Security (Required)
SECRET_KEY='another-long-random-secret'
CSRF_SECRET='yet-another-long-random-secret'

# Public URL (Required)
NEXT_PUBLIC_BASE_URL='https://yourdomain.com'

# AI Features (Optional)
GEMINI_API_KEY='your-gemini-api-key'

# Email (Optional)
MAILGUN_USER='your-mailgun-user'
MAILGUN_PASS='your-mailgun-password'

# Application (Optional)
WEBSITE_TYPE='blog'
NODE_ENV='production'
```

### Security Best Practices

1. **Never commit secrets** to Git
2. **Use strong passwords** (minimum 32 characters for secrets)
3. **Rotate secrets** regularly
4. **Use environment-specific** values
5. **Enable HTTPS** always
6. **Set secure headers** in Nginx/platform

### Generate Secure Secrets

```bash
# Generate random secrets
openssl rand -base64 32
```

## Database Migration

### First Deployment

```bash
# Deploy migrations
npx prisma migrate deploy

# Verify
npx prisma migrate status
```

### Updating Deployed Application

When you have schema changes:

```bash
# 1. Create migration locally
npx prisma migrate dev --name description

# 2. Commit migration files
git add prisma/migrations
git commit -m "Add database migration"
git push

# 3. Deploy will automatically run migrations
```

### Manual Migration on Server

If automatic migrations fail:

```bash
# SSH into server or use platform CLI

# Run migrations
npx prisma migrate deploy

# Verify
npx prisma migrate status

# If issues occur, reset (CAUTION: data loss)
npx prisma migrate reset
```

### Database Backup Before Migration

```bash
# PostgreSQL backup
pg_dump -U username -h hostname -d database > backup.sql

# Restore if needed
psql -U username -h hostname -d database < backup.sql
```

## Post-Deployment Tasks

### 1. Create Admin User

```bash
# Self-hosted
npm run create-admin

# Vercel
vercel exec -- npm run create-admin

# Railway/Render
# Use platform CLI or web terminal
```

### 2. Test Application

- [ ] Homepage loads correctly
- [ ] Login works
- [ ] Admin panel accessible
- [ ] Create test blog post
- [ ] Test image upload
- [ ] Verify email sending (if configured)
- [ ] Test AI features (if configured)

### 3. Configure Monitoring

#### Vercel Analytics

Enable in Project Settings > Analytics

#### Self-Hosted: PM2 Monitoring

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
```

#### Application Performance Monitoring

Consider integrating:
- **Sentry**: Error tracking
- **LogRocket**: Session replay
- **New Relic**: Performance monitoring

### 4. Setup Backups

#### Database Backups

**Automated backup script** for self-hosted:

Create `/etc/cron.daily/backup-blog-db`:

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR=/backups/blog
mkdir -p $BACKUP_DIR

pg_dump -U blog_user -h localhost blog_db | gzip > $BACKUP_DIR/blog_db_$DATE.sql.gz

# Keep only last 30 days
find $BACKUP_DIR -name "blog_db_*.sql.gz" -mtime +30 -delete
```

Make executable:
```bash
sudo chmod +x /etc/cron.daily/backup-blog-db
```

**SaaS Platforms:**
- Most provide automatic backups
- Configure backup retention in platform settings

### 5. Setup SSL Certificate Renewal

For self-hosted with Let's Encrypt:

```bash
# Certbot handles renewal automatically
# Verify renewal works
sudo certbot renew --dry-run

# Check renewal timer
sudo systemctl status certbot.timer
```

## Monitoring and Maintenance

### Health Checks

#### Self-Hosted

Create health check endpoint in `/pages/api/health.ts`:

```typescript
import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Database connection failed'
    });
  }
}
```

Monitor endpoint:
```bash
curl https://yourdomain.com/api/health
```

### Log Management

#### PM2 Logs

```bash
# View logs
pm2 logs blog

# Clear logs
pm2 flush

# Rotate logs
pm2 install pm2-logrotate
```

#### Platform Logs

- **Vercel**: Dashboard > Deployments > Logs
- **Railway**: Service > Logs
- **Render**: Dashboard > Logs

### Performance Optimization

#### Enable Caching

Add to `next.config.mjs`:

```javascript
const nextConfig = {
  // ... existing config
  experimental: {
    optimizeCss: true,
  },
  images: {
    minimumCacheTTL: 2592000, // 30 days
  },
};
```

#### CDN Configuration

For self-hosted, use Cloudflare:

1. Sign up at [cloudflare.com](https://cloudflare.com)
2. Add your domain
3. Update nameservers
4. Enable caching rules

### Scaling

#### Vertical Scaling

Increase server resources:
- More RAM
- More CPU cores
- Faster storage (SSD)

#### Horizontal Scaling

For high traffic:

1. **Database**: Use connection pooling
   ```env
   DATABASE_URL="postgresql://user:pass@host:5432/db?pgbouncer=true&connection_limit=10"
   ```

2. **Application**: Use PM2 cluster mode (already configured)

3. **Load Balancer**: Use Nginx or cloud load balancer

4. **CDN**: Cloudflare or AWS CloudFront

### Troubleshooting Deployments

#### Build Fails

Check:
- Node.js version compatibility
- Environment variables set correctly
- Dependencies install successfully
- Build command is correct

#### Application Won't Start

Check:
- Port configuration
- Environment variables
- Database connection
- Logs for errors

#### Database Connection Issues

Check:
- Connection string format
- Database is running
- Firewall rules
- SSL requirements

#### 502/504 Errors

Check:
- Application is running
- Correct port forwarding
- Memory limits not exceeded
- PM2/process manager status

## Rollback Procedures

### Vercel

```bash
# List deployments
vercel ls

# Promote previous deployment
vercel promote [deployment-url]
```

### Self-Hosted

```bash
# Revert to previous version
git log
git checkout <previous-commit>
npm install --legacy-peer-deps
npm run build
pm2 restart blog
```

### Database Rollback

```bash
# Restore from backup
psql -U username -h hostname -d database < backup.sql
```

## Support and Resources

- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **Prisma Production**: https://www.prisma.io/docs/guides/deployment
- **Vercel Docs**: https://vercel.com/docs
- **Railway Docs**: https://docs.railway.app
- **Render Docs**: https://render.com/docs

## Next Steps

After deployment:

1. Review [Monitoring and Maintenance](#monitoring-and-maintenance)
2. Setup [regular backups](#4-setup-backups)
3. Configure [error tracking](https://sentry.io)
4. Plan [scaling strategy](#scaling)
5. Document your specific deployment process
