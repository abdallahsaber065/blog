# Database Schema Documentation

Complete reference for the blog application's database schema using PostgreSQL and Prisma ORM.

## Table of Contents

- [Overview](#overview)
- [Entity Relationship Diagram](#entity-relationship-diagram)
- [Tables](#tables)
- [Relationships](#relationships)
- [Indexes](#indexes)
- [Constraints](#constraints)
- [Migrations](#migrations)

## Overview

### Database Technology

- **Database**: PostgreSQL 13+
- **ORM**: Prisma 5.22
- **Migration Tool**: Prisma Migrate

### Schema Location

```
prisma/schema.prisma
```

### Key Features

- **ACID Compliance**: Guaranteed data consistency
- **Referential Integrity**: Foreign key constraints
- **Cascading Deletes**: Automatic cleanup of related data
- **Timestamps**: Automatic created_at and updated_at tracking
- **Indexes**: Optimized queries on frequently accessed fields

## Entity Relationship Diagram

```
┌─────────────────┐
│      User       │
├─────────────────┤
│ id (PK)         │───┐
│ username        │   │
│ email           │   │
│ password        │   │
│ role            │   │
│ created_at      │   │
└─────────────────┘   │
         │            │
         │            │
         │ 1          │ 1
         │            │
         │ *          │ *
         ▼            ▼
┌─────────────────┐  ┌─────────────────┐
│      Post       │  │  MediaLibrary   │
├─────────────────┤  ├─────────────────┤
│ id (PK)         │  │ id (PK)         │
│ title           │  │ file_name       │
│ slug (UK)       │  │ file_url        │
│ content         │  │ file_size       │
│ author_id (FK)  │  │ uploaded_by (FK)│
│ category_id(FK) │  └─────────────────┘
│ status          │
│ views           │  ┌─────────────────┐
│ created_at      │  │   FileLibrary   │
└─────────────────┘  ├─────────────────┤
    │        │       │ id (PK)         │
    │ 1      │       │ file_name       │
    │        │ *     │ file_url        │
    │ *      └───────│ uploaded_by (FK)│
    │   *            └─────────────────┘
    │    *
    │     *
    ▼      ▼
┌─────────────────┐  ┌─────────────────┐
│    Comment      │  │      Tag        │
├─────────────────┤  ├─────────────────┤
│ id (PK)         │  │ id (PK)         │
│ post_id (FK)    │  │ name (UK)       │
│ content         │  │ slug (UK)       │
│ author_name     │  └─────────────────┘
│ author_email    │           │
│ status          │           │ *
│ created_at      │           │
└─────────────────┘           │ *
                              │
                              ▼
                    ┌─────────────────┐
                    │   Category      │
                    ├─────────────────┤
                    │ id (PK)         │
                    │ name (UK)       │
                    │ slug (UK)       │
                    │ description     │
                    └─────────────────┘
```

## Tables

### User

Stores user account information and authentication data.

**Table Name:** `User`

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | Integer | No | autoincrement | Primary key |
| username | String | No | - | Unique username |
| email | String | No | - | Unique email address |
| password | String | No | - | Hashed password (bcrypt) |
| first_name | String | Yes | NULL | User's first name |
| last_name | String | Yes | NULL | User's last name |
| bio | String | Yes | NULL | User biography |
| profile_image_url | String | Yes | NULL | Profile image URL |
| role | String | No | "reader" | User role (reader/author/moderator/admin) |
| created_at | DateTime | No | now() | Account creation timestamp |
| updated_at | DateTime | No | now() | Last update timestamp |
| email_verified | Boolean | No | false | Email verification status |
| verification_token | String | Yes | NULL | Email verification token |
| reset_token | String | Yes | NULL | Password reset token |
| reset_token_expires | DateTime | Yes | NULL | Reset token expiration |

**Unique Constraints:**
- username
- email

**Indexes:**
- username (unique)
- email (unique)
- role
- verification_token
- reset_token

**Relationships:**
- Has many Posts (as author)
- Has many MediaLibrary items
- Has many FileLibrary items
- Has many PostPermissions

---

### Post

Stores blog post content and metadata.

**Table Name:** `Post`

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | Integer | No | autoincrement | Primary key |
| title | String | No | - | Post title |
| slug | String | No | - | URL-friendly slug |
| content | String | No | - | Post content (markdown) |
| excerpt | String | Yes | NULL | Short description |
| author_id | Integer | Yes | NULL | Foreign key to User |
| category_id | Integer | Yes | NULL | Foreign key to Category |
| status | String | No | "draft" | Post status (draft/published/archived) |
| featured_image_url | String | Yes | NULL | Featured image URL |
| views | Integer | No | 0 | View count |
| created_at | DateTime | No | now() | Creation timestamp |
| updated_at | DateTime | No | now() | Last update timestamp |
| published_at | DateTime | Yes | NULL | Publication timestamp |
| reading_time | Integer | Yes | NULL | Estimated reading time (minutes) |
| outline | String | Yes | NULL | AI-generated outline (JSON) |

**Unique Constraints:**
- slug

**Indexes:**
- slug (unique)
- author_id
- category_id
- status
- published_at
- created_at

**Relationships:**
- Belongs to User (author)
- Belongs to Category
- Has many Comments
- Has many Tags (many-to-many)
- Has many PostViews
- Has many PostPermissions

---

### Category

Organizes posts into categories.

**Table Name:** `Category`

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | Integer | No | autoincrement | Primary key |
| name | String | No | - | Category name |
| slug | String | No | - | URL-friendly slug |
| description | String | Yes | NULL | Category description |

**Unique Constraints:**
- name
- slug

**Indexes:**
- name (unique)
- slug (unique)

**Relationships:**
- Has many Posts

---

### Tag

Tags for flexible content labeling.

**Table Name:** `Tag`

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | Integer | No | autoincrement | Primary key |
| name | String | No | - | Tag name |
| slug | String | No | - | URL-friendly slug |

**Unique Constraints:**
- name
- slug

**Indexes:**
- name (unique)
- slug (unique)

**Relationships:**
- Has many Posts (many-to-many)

---

### Comment

Stores comments on blog posts.

**Table Name:** `Comment`

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | Integer | No | autoincrement | Primary key |
| post_id | Integer | No | - | Foreign key to Post |
| author_name | String | No | - | Commenter's name |
| author_email | String | No | - | Commenter's email |
| content | String | No | - | Comment content |
| status | String | No | "pending" | Comment status (pending/approved/spam) |
| created_at | DateTime | No | now() | Creation timestamp |
| updated_at | DateTime | No | now() | Last update timestamp |

**Indexes:**
- post_id
- status
- created_at

**Relationships:**
- Belongs to Post (cascade delete)

---

### PostView

Tracks post views for analytics.

**Table Name:** `PostView`

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | Integer | No | autoincrement | Primary key |
| post_id | Integer | No | - | Foreign key to Post |
| viewed_at | DateTime | No | now() | View timestamp |
| viewer_ip | String | Yes | NULL | Viewer IP address (hashed) |

**Indexes:**
- post_id
- viewed_at
- viewer_ip

**Relationships:**
- Belongs to Post (cascade delete)

---

### NewsletterSubscription

Stores newsletter email subscriptions.

**Table Name:** `NewsletterSubscription`

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | Integer | No | autoincrement | Primary key |
| email | String | No | - | Subscriber email |
| subscribed | Boolean | No | true | Subscription status |
| created_at | DateTime | No | now() | Subscription timestamp |
| updated_at | DateTime | No | now() | Last update timestamp |
| user_ip | String | Yes | NULL | Subscriber IP address |

**Unique Constraints:**
- email

**Indexes:**
- email (unique)
- subscribed

---

### MediaLibrary

Stores uploaded image files metadata.

**Table Name:** `MediaLibrary`

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | Integer | No | autoincrement | Primary key |
| file_name | String | No | - | Original filename |
| file_type | String | Yes | NULL | MIME type |
| file_size | Integer | Yes | NULL | File size (bytes) |
| file_url | String | No | - | File URL/path |
| width | Integer | Yes | NULL | Image width (pixels) |
| height | Integer | Yes | NULL | Image height (pixels) |
| uploaded_at | DateTime | No | now() | Upload timestamp |
| uploaded_by_id | Integer | Yes | NULL | Foreign key to User |

**Indexes:**
- uploaded_by_id
- uploaded_at
- file_type

**Relationships:**
- Belongs to User (uploader)

---

### FileLibrary

Stores uploaded document files metadata.

**Table Name:** `FileLibrary`

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | Integer | No | autoincrement | Primary key |
| file_name | String | No | - | Original filename |
| file_type | String | Yes | NULL | MIME type |
| file_size | Integer | Yes | NULL | File size (bytes) |
| file_url | String | No | - | File URL/path |
| width | Integer | Yes | NULL | Not used for documents |
| height | Integer | Yes | NULL | Not used for documents |
| uploaded_at | DateTime | No | now() | Upload timestamp |
| uploaded_by_id | Integer | Yes | NULL | Foreign key to User |

**Indexes:**
- uploaded_by_id
- uploaded_at

**Relationships:**
- Belongs to User (uploader)

---

### Setting

Stores application-wide settings.

**Table Name:** `Setting`

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | Integer | No | autoincrement | Primary key |
| setting_name | String | No | - | Setting name (unique) |
| setting_value | String | No | - | Setting value |

**Unique Constraints:**
- setting_name

**Indexes:**
- setting_name (unique)

---

### PostPermission

Manages fine-grained post access permissions.

**Table Name:** `PostPermission`

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | Integer | No | autoincrement | Primary key |
| post_id | Integer | No | - | Foreign key to Post |
| user_id | Integer | Yes | NULL | Foreign key to User |
| role | String | Yes | NULL | Role-based permission |
| created_at | DateTime | No | now() | Creation timestamp |
| updated_at | DateTime | No | now() | Last update timestamp |

**Unique Constraints:**
- (post_id, user_id, role) composite

**Indexes:**
- post_id
- user_id
- role

**Relationships:**
- Belongs to Post (cascade delete)
- Belongs to User (cascade delete)

---

## Relationships

### One-to-Many Relationships

1. **User → Post**
   - One user can author many posts
   - `User.posts` ← → `Post.author`
   - Foreign key: `Post.author_id`
   - On delete: SET NULL

2. **User → MediaLibrary**
   - One user can upload many media files
   - `User.media_library` ← → `MediaLibrary.uploaded_by`
   - Foreign key: `MediaLibrary.uploaded_by_id`
   - On delete: SET NULL

3. **User → FileLibrary**
   - One user can upload many files
   - `User.FileLibrary` ← → `FileLibrary.uploaded_by`
   - Foreign key: `FileLibrary.uploaded_by_id`
   - On delete: SET NULL

4. **Post → Comment**
   - One post can have many comments
   - `Post.comments` ← → `Comment.post`
   - Foreign key: `Comment.post_id`
   - On delete: CASCADE

5. **Post → PostView**
   - One post can have many views
   - `Post.post_views` ← → `PostView.post`
   - Foreign key: `PostView.post_id`
   - On delete: CASCADE

6. **Category → Post**
   - One category can have many posts
   - `Category.posts` ← → `Post.category`
   - Foreign key: `Post.category_id`
   - On delete: SET NULL

### Many-to-Many Relationships

1. **Post ↔ Tag**
   - Posts can have multiple tags
   - Tags can be applied to multiple posts
   - `Post.tags` ← → `Tag.posts`
   - Junction table: `_PostToTag` (implicit)

### One-to-One Relationships

None currently defined.

## Indexes

### Performance Indexes

#### User Table
```sql
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_role_idx" ON "User"("role");
```

#### Post Table
```sql
CREATE UNIQUE INDEX "Post_slug_key" ON "Post"("slug");
CREATE INDEX "Post_author_id_idx" ON "Post"("author_id");
CREATE INDEX "Post_category_id_idx" ON "Post"("category_id");
CREATE INDEX "Post_status_idx" ON "Post"("status");
CREATE INDEX "Post_published_at_idx" ON "Post"("published_at");
CREATE INDEX "Post_created_at_idx" ON "Post"("created_at");
```

#### Comment Table
```sql
CREATE INDEX "Comment_post_id_idx" ON "Comment"("post_id");
CREATE INDEX "Comment_status_idx" ON "Comment"("status");
```

#### PostView Table
```sql
CREATE INDEX "PostView_post_id_idx" ON "PostView"("post_id");
CREATE INDEX "PostView_viewed_at_idx" ON "PostView"("viewed_at");
```

## Constraints

### Primary Keys

All tables have an auto-incrementing integer primary key named `id`.

### Foreign Keys

| Table | Column | References | On Delete |
|-------|--------|-----------|-----------|
| Post | author_id | User(id) | SET NULL |
| Post | category_id | Category(id) | SET NULL |
| Comment | post_id | Post(id) | CASCADE |
| PostView | post_id | Post(id) | CASCADE |
| PostPermission | post_id | Post(id) | CASCADE |
| PostPermission | user_id | User(id) | CASCADE |
| MediaLibrary | uploaded_by_id | User(id) | SET NULL |
| FileLibrary | uploaded_by_id | User(id) | SET NULL |

### Unique Constraints

| Table | Columns |
|-------|---------|
| User | username |
| User | email |
| Post | slug |
| Category | name |
| Category | slug |
| Tag | name |
| Tag | slug |
| NewsletterSubscription | email |
| Setting | setting_name |
| PostPermission | (post_id, user_id, role) |

### Check Constraints

#### Post Status
```sql
CHECK (status IN ('draft', 'published', 'archived'))
```

#### User Role
```sql
CHECK (role IN ('reader', 'author', 'moderator', 'admin'))
```

#### Comment Status
```sql
CHECK (status IN ('pending', 'approved', 'spam'))
```

## Migrations

### Migration Management

Migrations are managed with Prisma Migrate:

```bash
# Create a new migration
npx prisma migrate dev --name description_of_changes

# Apply migrations to production
npx prisma migrate deploy

# Check migration status
npx prisma migrate status

# Reset database (CAUTION: deletes all data)
npx prisma migrate reset
```

### Migration History

Migrations are stored in:
```
prisma/migrations/
├── 20240101000000_init/
│   └── migration.sql
├── 20240102000000_add_outline_to_posts/
│   └── migration.sql
└── migration_lock.toml
```

### Initial Migration

The initial migration creates all tables:

```sql
-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    -- ... other columns
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    -- ... other columns
    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_author_id_fkey" 
    FOREIGN KEY ("author_id") REFERENCES "User"("id") 
    ON DELETE SET NULL ON UPDATE CASCADE;
```

## Data Types

### Prisma to PostgreSQL Mapping

| Prisma Type | PostgreSQL Type | Description |
|------------|----------------|-------------|
| String | TEXT | Variable-length text |
| Int | INTEGER | 4-byte integer |
| Boolean | BOOLEAN | True/false value |
| DateTime | TIMESTAMP(3) | Timestamp with milliseconds |
| Json | JSONB | Binary JSON data |

## Query Examples

### Common Queries

#### Get User with Posts

```typescript
const user = await prisma.user.findUnique({
  where: { id: 1 },
  include: {
    posts: {
      where: { status: 'published' },
      orderBy: { published_at: 'desc' }
    }
  }
});
```

#### Get Post with All Relations

```typescript
const post = await prisma.post.findUnique({
  where: { slug: 'my-post' },
  include: {
    author: {
      select: {
        id: true,
        username: true,
        profile_image_url: true
      }
    },
    category: true,
    tags: true,
    comments: {
      where: { status: 'approved' },
      orderBy: { created_at: 'desc' }
    }
  }
});
```

#### Search Posts

```typescript
const posts = await prisma.post.findMany({
  where: {
    OR: [
      { title: { contains: searchTerm, mode: 'insensitive' } },
      { content: { contains: searchTerm, mode: 'insensitive' } }
    ],
    status: 'published'
  },
  include: {
    author: true,
    category: true,
    tags: true
  },
  orderBy: { published_at: 'desc' },
  take: 10
});
```

#### Aggregate Views

```typescript
const stats = await prisma.post.aggregate({
  where: { status: 'published' },
  _sum: { views: true },
  _count: { id: true },
  _avg: { views: true }
});
```

## Performance Optimization

### Query Optimization Tips

1. **Use Select to Limit Fields**
   ```typescript
   const users = await prisma.user.findMany({
     select: { id: true, username: true }
   });
   ```

2. **Use Indexes for Frequent Queries**
   - Already indexed: slug, email, username
   - Add custom indexes if needed

3. **Batch Operations**
   ```typescript
   await prisma.post.createMany({
     data: posts,
     skipDuplicates: true
   });
   ```

4. **Connection Pooling**
   ```env
   DATABASE_URL="postgresql://user:pass@host/db?connection_limit=10"
   ```

### Database Maintenance

#### Vacuum and Analyze

Run periodically to optimize performance:

```sql
VACUUM ANALYZE;
```

#### Reindex

If queries slow down:

```sql
REINDEX DATABASE blog_db;
```

## Backup and Restore

### Backup Database

```bash
# Full backup
pg_dump -U username -h hostname -d blog_db > backup.sql

# Schema only
pg_dump -U username -h hostname -d blog_db --schema-only > schema.sql

# Data only
pg_dump -U username -h hostname -d blog_db --data-only > data.sql
```

### Restore Database

```bash
# Restore full backup
psql -U username -h hostname -d blog_db < backup.sql

# Restore specific table
pg_restore -U username -d blog_db -t users backup.sql
```

## Schema Validation

### Validate Schema

```bash
# Validate Prisma schema
npx prisma validate

# Check for drift between schema and database
npx prisma db pull
git diff prisma/schema.prisma
```

### Regenerate Client

After schema changes:

```bash
npx prisma generate
```

## Security Considerations

### Password Storage

- Passwords are hashed with bcrypt (10 rounds)
- Never store plain text passwords
- Reset tokens expire after 1 hour

### SQL Injection Prevention

- Prisma uses parameterized queries
- All user input is automatically escaped
- Never use raw SQL with user input

### Data Privacy

- Store minimal personal data
- Hash IP addresses before storage
- Implement GDPR compliance for EU users
- Allow users to delete their data

## Troubleshooting

### Common Issues

#### Migration Failed

```bash
# View migration status
npx prisma migrate status

# Mark migration as applied (if it actually succeeded)
npx prisma migrate resolve --applied "migration_name"

# Rollback (requires manual intervention)
# Restore from backup and replay successful migrations
```

#### Connection Pool Exhausted

Increase connection limit:

```env
DATABASE_URL="postgresql://user:pass@host/db?connection_limit=20"
```

#### Slow Queries

Enable query logging:

```typescript
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error']
});
```

## Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Architecture Documentation](./ARCHITECTURE.md)
- [API Documentation](./API_DOCUMENTATION.md)
