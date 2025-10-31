# API Documentation

Complete reference for all API endpoints in the blog application.

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Posts API](#posts-api)
- [Categories API](#categories-api)
- [Tags API](#tags-api)
- [AI Content Generation API](#ai-content-generation-api)
- [Media API](#media-api)
- [File Library API](#file-library-api)
- [User API](#user-api)
- [Newsletter API](#newsletter-api)
- [Search API](#search-api)
- [Contact API](#contact-api)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)

## Overview

### Base URL

```
Development: http://localhost:3000/api
Production:  https://yourdomain.com/api
```

### Request Format

All requests should use:
- **Content-Type**: `application/json` (for JSON payloads)
- **Content-Type**: `multipart/form-data` (for file uploads)

### Response Format

#### Success Response

```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Optional success message"
}
```

#### Error Response

```json
{
  "success": false,
  "error": "Error message",
  "details": { /* optional error details */ }
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (not authenticated)
- `403` - Forbidden (not authorized)
- `404` - Not Found
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

## Authentication

All authentication endpoints are prefixed with `/api/auth`.

### Sign Up

Create a new user account.

**Endpoint:** `POST /api/auth/signup`

**Request Body:**

```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "first_name": "John",
  "last_name": "Doe"
}
```

**Response:**

```json
{
  "success": true,
  "message": "User created successfully. Please verify your email.",
  "data": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com"
  }
}
```

**Validation Rules:**
- `username`: 3-30 characters, alphanumeric and underscore only
- `email`: Valid email format
- `password`: Minimum 8 characters, at least one uppercase, one lowercase, one number

---

### Login

Authenticate a user and create a session.

**Endpoint:** `POST /api/auth/login`

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "username": "johndoe",
      "email": "john@example.com",
      "role": "author"
    },
    "token": "jwt-token-here"
  }
}
```

**Rate Limit:** 5 requests per 15 minutes

---

### Logout

Invalidate the current session.

**Endpoint:** `POST /api/auth/logout`

**Authentication:** Required

**Response:**

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### Get Current User

Get the authenticated user's information.

**Endpoint:** `GET /api/auth/user`

**Authentication:** Required

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "author",
    "bio": "Software developer",
    "profile_image_url": "/uploads/profile.jpg",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### Check Uniqueness

Check if username or email is already taken.

**Endpoint:** `POST /api/auth/check-uniqueness`

**Request Body:**

```json
{
  "email": "john@example.com",
  "username": "johndoe"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "email_available": false,
    "username_available": true
  }
}
```

---

### Request Password Reset

Request a password reset email.

**Endpoint:** `POST /api/auth/request-password-reset`

**Request Body:**

```json
{
  "email": "john@example.com"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

**Rate Limit:** 3 requests per hour

---

### Reset Password

Reset password using token from email.

**Endpoint:** `POST /api/auth/reset-password`

**Request Body:**

```json
{
  "token": "reset-token-from-email",
  "password": "NewSecurePass123!"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

---

### Verify Email

Verify email address using token.

**Endpoint:** `POST /api/auth/verify-email`

**Request Body:**

```json
{
  "token": "verification-token-from-email"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

---

### Request Email Verification

Request a new verification email.

**Endpoint:** `POST /api/auth/request-verification`

**Request Body:**

```json
{
  "email": "john@example.com"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Verification email sent"
}
```

**Rate Limit:** 3 requests per hour

---

## Posts API

Endpoints for managing blog posts.

### List Posts

Get a paginated list of posts.

**Endpoint:** `GET /api/posts`

**Authentication:** Optional (required for drafts)

**Query Parameters:**

```
page: number (default: 1)
limit: number (default: 10, max: 100)
status: "draft" | "published" | "archived"
category: string (category slug)
tag: string (tag slug)
author: number (author user ID)
search: string (search in title and content)
sort: "latest" | "popular" | "oldest" (default: "latest")
```

**Example Request:**

```
GET /api/posts?page=1&limit=20&status=published&category=tech&sort=popular
```

**Response:**

```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": 1,
        "title": "Getting Started with Next.js",
        "slug": "getting-started-with-nextjs",
        "excerpt": "Learn the basics of Next.js...",
        "content": "Full content here...",
        "status": "published",
        "featured_image_url": "/uploads/nextjs.jpg",
        "views": 1234,
        "reading_time": 5,
        "published_at": "2024-01-15T10:00:00.000Z",
        "created_at": "2024-01-10T10:00:00.000Z",
        "updated_at": "2024-01-15T10:00:00.000Z",
        "author": {
          "id": 1,
          "username": "johndoe",
          "profile_image_url": "/uploads/profile.jpg"
        },
        "category": {
          "id": 1,
          "name": "Technology",
          "slug": "tech"
        },
        "tags": [
          { "id": 1, "name": "JavaScript", "slug": "javascript" },
          { "id": 2, "name": "React", "slug": "react" }
        ]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "totalPages": 3
    }
  }
}
```

---

### Get Single Post

Get a single post by ID or slug.

**Endpoint:** `GET /api/posts/:id`

**Authentication:** Optional (required for drafts)

**Parameters:**
- `id`: Post ID or slug

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Getting Started with Next.js",
    "slug": "getting-started-with-nextjs",
    "content": "Full markdown content...",
    "excerpt": "Learn the basics...",
    "status": "published",
    "featured_image_url": "/uploads/nextjs.jpg",
    "views": 1234,
    "reading_time": 5,
    "outline": "{\"sections\": [...]}",
    "published_at": "2024-01-15T10:00:00.000Z",
    "author": {
      "id": 1,
      "username": "johndoe",
      "email": "john@example.com",
      "profile_image_url": "/uploads/profile.jpg"
    },
    "category": {
      "id": 1,
      "name": "Technology",
      "slug": "tech"
    },
    "tags": [
      { "id": 1, "name": "JavaScript", "slug": "javascript" }
    ],
    "comments": [
      {
        "id": 1,
        "author_name": "Jane Doe",
        "content": "Great post!",
        "created_at": "2024-01-16T10:00:00.000Z"
      }
    ]
  }
}
```

---

### Create Post

Create a new blog post.

**Endpoint:** `POST /api/posts`

**Authentication:** Required (author, moderator, or admin)

**Request Body:**

```json
{
  "title": "Getting Started with Next.js",
  "content": "Full markdown content...",
  "excerpt": "Learn the basics...",
  "status": "draft",
  "featured_image_url": "/uploads/nextjs.jpg",
  "category_id": 1,
  "tag_ids": [1, 2, 3],
  "outline": "{\"sections\": [...]}"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Post created successfully",
  "data": {
    "id": 1,
    "title": "Getting Started with Next.js",
    "slug": "getting-started-with-nextjs",
    "status": "draft",
    "created_at": "2024-01-15T10:00:00.000Z"
  }
}
```

---

### Update Post

Update an existing post.

**Endpoint:** `PUT /api/posts/:id`

**Authentication:** Required (post author, moderator, or admin)

**Request Body:**

```json
{
  "title": "Updated Title",
  "content": "Updated content...",
  "status": "published"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Post updated successfully",
  "data": {
    "id": 1,
    "title": "Updated Title",
    "slug": "updated-title",
    "updated_at": "2024-01-16T10:00:00.000Z"
  }
}
```

---

### Delete Post

Delete a post.

**Endpoint:** `DELETE /api/posts/:id`

**Authentication:** Required (post author, moderator, or admin)

**Response:**

```json
{
  "success": true,
  "message": "Post deleted successfully"
}
```

---

### Get Post Permissions

Get permissions for a specific post.

**Endpoint:** `GET /api/posts/:id/permissions`

**Authentication:** Required (post author or admin)

**Response:**

```json
{
  "success": true,
  "data": {
    "permissions": [
      {
        "id": 1,
        "post_id": 1,
        "user_id": 2,
        "role": null,
        "created_at": "2024-01-15T10:00:00.000Z"
      }
    ]
  }
}
```

---

### Update Post Permissions

Set permissions for a post.

**Endpoint:** `POST /api/posts/:id/permissions`

**Authentication:** Required (post author or admin)

**Request Body:**

```json
{
  "user_ids": [2, 3],
  "roles": ["author"]
}
```

**Response:**

```json
{
  "success": true,
  "message": "Permissions updated successfully"
}
```

---

## Categories API

Endpoints for managing categories.

### List Categories

Get all categories.

**Endpoint:** `GET /api/categories`

**Authentication:** Optional

**Query Parameters:**

```
include_count: boolean (include post count)
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Technology",
      "slug": "tech",
      "description": "Tech-related posts",
      "post_count": 42
    }
  ]
}
```

---

### Create Category

Create a new category.

**Endpoint:** `POST /api/categories`

**Authentication:** Required (moderator or admin)

**Request Body:**

```json
{
  "name": "Technology",
  "description": "Tech-related posts"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Category created successfully",
  "data": {
    "id": 1,
    "name": "Technology",
    "slug": "tech"
  }
}
```

---

### Update Category

Update a category.

**Endpoint:** `PUT /api/categories/:id`

**Authentication:** Required (moderator or admin)

**Request Body:**

```json
{
  "name": "Updated Name",
  "description": "Updated description"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Category updated successfully"
}
```

---

### Delete Category

Delete a category.

**Endpoint:** `DELETE /api/categories/:id`

**Authentication:** Required (moderator or admin)

**Response:**

```json
{
  "success": true,
  "message": "Category deleted successfully"
}
```

---

### Delete Empty Categories

Delete categories with no posts.

**Endpoint:** `DELETE /api/categories/delete-zero`

**Authentication:** Required (admin)

**Response:**

```json
{
  "success": true,
  "message": "Deleted 5 empty categories"
}
```

---

## Tags API

Endpoints for managing tags.

### List Tags

Get all tags.

**Endpoint:** `GET /api/tags`

**Authentication:** Optional

**Query Parameters:**

```
include_count: boolean (include post count)
search: string (search by name)
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "JavaScript",
      "slug": "javascript",
      "post_count": 25
    }
  ]
}
```

---

### Create Tag

Create a new tag.

**Endpoint:** `POST /api/tags`

**Authentication:** Required (author, moderator, or admin)

**Request Body:**

```json
{
  "name": "JavaScript"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Tag created successfully",
  "data": {
    "id": 1,
    "name": "JavaScript",
    "slug": "javascript"
  }
}
```

---

### Update Tag

Update a tag.

**Endpoint:** `PUT /api/tags/:id`

**Authentication:** Required (moderator or admin)

**Request Body:**

```json
{
  "name": "Updated Name"
}
```

---

### Delete Tag

Delete a tag.

**Endpoint:** `DELETE /api/tags/:id`

**Authentication:** Required (moderator or admin)

---

### Delete Empty Tags

Delete tags with no posts.

**Endpoint:** `DELETE /api/tags/delete-zero`

**Authentication:** Required (admin)

**Response:**

```json
{
  "success": true,
  "message": "Deleted 10 empty tags"
}
```

---

## AI Content Generation API

Endpoints for AI-powered content generation using Google Gemini.

### Generate Outline

Generate a structured content outline.

**Endpoint:** `POST /api/ai/generate-outline`

**Authentication:** Required (author, moderator, or admin)

**Request Body:**

```json
{
  "topic": "Getting Started with Next.js",
  "num_of_keywords": 20,
  "num_of_points": 5,
  "user_custom_instructions": "Make it beginner-friendly",
  "website_type": "blog",
  "files": ["base64-encoded-file-content"]
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "outline": {
      "main_title": "Getting Started with Next.js",
      "introduction": "Next.js is a powerful React framework...",
      "sections": [
        {
          "title": "What is Next.js?",
          "description": "Introduction to Next.js",
          "points": [
            "React-based framework",
            "Server-side rendering",
            "Static site generation"
          ]
        }
      ],
      "conclusion": "Next.js provides a great developer experience..."
    },
    "search_terms": "next.js tutorial, react framework, ssr"
  }
}
```

**Rate Limit:** 10 requests per hour

---

### Generate Content

Generate full blog post content with streaming.

**Endpoint:** `POST /api/ai/generate-content`

**Authentication:** Required (author, moderator, or admin)

**Request Body:**

```json
{
  "topic": "Getting Started with Next.js",
  "outline": {
    "main_title": "...",
    "sections": [...]
  },
  "search_terms": "next.js tutorial",
  "include_images": true,
  "user_custom_instructions": "Include code examples",
  "website_type": "blog"
}
```

**Response:** Server-Sent Events (SSE) stream

```
data: {"chunk": "# Getting Started with Next.js\n\n", "done": false}

data: {"chunk": "Next.js is a powerful React framework...", "done": false}

data: {"chunk": "", "done": true, "content": "full-content-here"}
```

**Client Example:**

```javascript
const eventSource = new EventSource('/api/ai/generate-content');

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  if (data.done) {
    console.log('Generation complete!');
    eventSource.close();
  } else {
    console.log('Chunk:', data.chunk);
  }
};
```

**Rate Limit:** 5 requests per hour

---

### Generate Metadata

Generate SEO metadata for a post.

**Endpoint:** `POST /api/ai/generate-metadata`

**Authentication:** Required (author, moderator, or admin)

**Request Body:**

```json
{
  "topic": "Getting Started with Next.js",
  "content": "Full post content...",
  "old_tags": ["JavaScript", "React"],
  "old_categories": ["Technology", "Web Development"]
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "title": "Getting Started with Next.js: A Complete Guide",
    "excerpt": "Learn how to build modern web applications with Next.js...",
    "tags": ["Next.js", "React", "JavaScript", "SSR"],
    "main_category": "Web Development"
  }
}
```

**Rate Limit:** 20 requests per hour

---

## Media API

Endpoints for managing images and media files.

### Upload Image

Upload an image file.

**Endpoint:** `POST /api/media/upload-image`

**Authentication:** Required

**Content-Type:** `multipart/form-data`

**Request Body:**

```
image: File (max 5MB, jpeg/png/webp)
```

**Response:**

```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "id": 1,
    "file_name": "image.jpg",
    "file_url": "/uploads/2024/01/image.jpg",
    "file_type": "image/jpeg",
    "file_size": 1024000,
    "width": 1920,
    "height": 1080,
    "uploaded_at": "2024-01-15T10:00:00.000Z"
  }
}
```

**Rate Limit:** 20 requests per hour

---

### List Media

Get all uploaded media files.

**Endpoint:** `GET /api/media`

**Authentication:** Required

**Query Parameters:**

```
page: number (default: 1)
limit: number (default: 20)
type: "image/jpeg" | "image/png" | "image/webp"
```

**Response:**

```json
{
  "success": true,
  "data": {
    "media": [
      {
        "id": 1,
        "file_name": "image.jpg",
        "file_url": "/uploads/2024/01/image.jpg",
        "file_type": "image/jpeg",
        "file_size": 1024000,
        "width": 1920,
        "height": 1080,
        "uploaded_at": "2024-01-15T10:00:00.000Z",
        "uploaded_by": {
          "id": 1,
          "username": "johndoe"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100
    }
  }
}
```

---

### Delete Media

Delete a media file.

**Endpoint:** `DELETE /api/media/:id`

**Authentication:** Required (file owner or admin)

**Response:**

```json
{
  "success": true,
  "message": "Media deleted successfully"
}
```

---

### Delete All Media

Delete all media files (admin only).

**Endpoint:** `DELETE /api/media/delete-all`

**Authentication:** Required (admin)

**Response:**

```json
{
  "success": true,
  "message": "Deleted 50 media files"
}
```

---

## File Library API

Endpoints for managing document files (PDF, TXT, etc.).

### Upload File

Upload a document file.

**Endpoint:** `POST /api/files/upload`

**Authentication:** Required

**Content-Type:** `multipart/form-data`

**Request Body:**

```
file: File (max 10MB, pdf/txt/doc/docx)
```

**Response:**

```json
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "id": 1,
    "file_name": "document.pdf",
    "file_url": "/uploads/files/document.pdf",
    "file_type": "application/pdf",
    "file_size": 2048000,
    "uploaded_at": "2024-01-15T10:00:00.000Z"
  }
}
```

---

### List Files

Get all uploaded files.

**Endpoint:** `GET /api/files`

**Authentication:** Required

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "file_name": "document.pdf",
      "file_url": "/uploads/files/document.pdf",
      "file_type": "application/pdf",
      "file_size": 2048000,
      "uploaded_at": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

---

### Download File

Download a file.

**Endpoint:** `GET /api/files/download/:id`

**Authentication:** Required

**Response:** File download

---

### Delete All Files

Delete all files (admin only).

**Endpoint:** `DELETE /api/files/delete-all`

**Authentication:** Required (admin)

---

## User API

Endpoints for managing users.

### List Users

Get all users.

**Endpoint:** `GET /api/users`

**Authentication:** Required (admin)

**Query Parameters:**

```
page: number
limit: number
role: "reader" | "author" | "moderator" | "admin"
```

**Response:**

```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": 1,
        "username": "johndoe",
        "email": "john@example.com",
        "role": "author",
        "created_at": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50
    }
  }
}
```

---

### Update User

Update a user.

**Endpoint:** `PUT /api/users/:id`

**Authentication:** Required (self or admin)

**Request Body:**

```json
{
  "first_name": "John",
  "last_name": "Doe",
  "bio": "Software developer",
  "profile_image_url": "/uploads/profile.jpg"
}
```

---

### Update User Role

Update a user's role.

**Endpoint:** `PUT /api/users/:id/role`

**Authentication:** Required (admin)

**Request Body:**

```json
{
  "role": "moderator"
}
```

---

## Newsletter API

Endpoints for managing newsletter subscriptions.

### Subscribe

Subscribe to newsletter.

**Endpoint:** `POST /api/newsletterSubscription/subscribe`

**Request Body:**

```json
{
  "email": "subscriber@example.com"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Subscribed successfully"
}
```

---

### List Subscriptions

Get all newsletter subscriptions.

**Endpoint:** `GET /api/newsletterSubscription`

**Authentication:** Required (admin)

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "email": "subscriber@example.com",
      "subscribed": true,
      "created_at": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

---

### Unsubscribe

Unsubscribe from newsletter.

**Endpoint:** `DELETE /api/newsletterSubscription/:id`

**Response:**

```json
{
  "success": true,
  "message": "Unsubscribed successfully"
}
```

---

### Import Subscriptions

Import multiple subscriptions from CSV.

**Endpoint:** `POST /api/newsletterSubscription/import`

**Authentication:** Required (admin)

**Content-Type:** `multipart/form-data`

**Request Body:**

```
file: CSV file with email column
```

---

## Search API

Search across posts, categories, and tags.

**Endpoint:** `GET /api/search`

**Query Parameters:**

```
q: string (search query)
type: "posts" | "categories" | "tags" | "all"
limit: number (default: 20)
```

**Example:**

```
GET /api/search?q=next.js&type=posts&limit=10
```

**Response:**

```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": 1,
        "title": "Getting Started with Next.js",
        "excerpt": "Learn the basics...",
        "slug": "getting-started-with-nextjs"
      }
    ],
    "categories": [],
    "tags": [
      {
        "id": 1,
        "name": "Next.js",
        "slug": "nextjs"
      }
    ]
  }
}
```

---

## Contact API

Send contact form submissions.

**Endpoint:** `POST /api/contact`

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Question about your blog",
  "message": "I have a question..."
}
```

**Response:**

```json
{
  "success": true,
  "message": "Message sent successfully"
}
```

**Rate Limit:** 3 requests per hour

---

## Error Handling

### Error Response Structure

```json
{
  "success": false,
  "error": "Human-readable error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "Specific validation error"
  }
}
```

### Common Error Codes

- `VALIDATION_ERROR`: Invalid request data
- `AUTHENTICATION_ERROR`: Not authenticated
- `AUTHORIZATION_ERROR`: Not authorized
- `NOT_FOUND`: Resource not found
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `INTERNAL_ERROR`: Server error

### Example Error Responses

#### Validation Error

```json
{
  "success": false,
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": {
    "title": "Title is required",
    "content": "Content must be at least 100 characters"
  }
}
```

#### Authentication Error

```json
{
  "success": false,
  "error": "Authentication required",
  "code": "AUTHENTICATION_ERROR"
}
```

#### Rate Limit Error

```json
{
  "success": false,
  "error": "Rate limit exceeded. Try again in 15 minutes.",
  "code": "RATE_LIMIT_EXCEEDED",
  "details": {
    "retry_after": 900
  }
}
```

---

## Rate Limiting

### Rate Limit Headers

All API responses include rate limit headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1234567890
```

### Rate Limits by Endpoint

| Endpoint | Limit | Window |
|----------|-------|--------|
| Auth (login, signup) | 5 | 15 minutes |
| Password reset | 3 | 1 hour |
| Email verification | 3 | 1 hour |
| AI outline generation | 10 | 1 hour |
| AI content generation | 5 | 1 hour |
| AI metadata generation | 20 | 1 hour |
| Image upload | 20 | 1 hour |
| File upload | 10 | 1 hour |
| Contact form | 3 | 1 hour |
| General API | 100 | 15 minutes |

### Handling Rate Limits

When you receive a 429 status code:

1. Check `X-RateLimit-Reset` header for reset time
2. Wait until the reset time
3. Implement exponential backoff in your client
4. Cache responses where possible

### Example Rate Limit Handling

```javascript
async function makeRequest(url, options) {
  const response = await fetch(url, options);
  
  if (response.status === 429) {
    const resetTime = response.headers.get('X-RateLimit-Reset');
    const waitTime = resetTime - Date.now() / 1000;
    
    console.log(`Rate limited. Retry after ${waitTime} seconds`);
    
    // Wait and retry
    await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
    return makeRequest(url, options);
  }
  
  return response.json();
}
```

---

## Authentication

### Using JWT Tokens

After login, include the JWT token in requests:

```javascript
fetch('/api/posts', {
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  }
});
```

### Using Session Cookies

NextAuth automatically handles sessions via cookies. No additional headers needed when using the same domain.

---

## Pagination

### Pagination Format

Paginated endpoints return:

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Making Paginated Requests

```javascript
// Get page 2 with 50 items
GET /api/posts?page=2&limit=50
```

---

## Best Practices

### 1. Error Handling

Always check the `success` field:

```javascript
const response = await fetch('/api/posts');
const data = await response.json();

if (!data.success) {
  console.error(data.error);
  return;
}

// Use data.data
```

### 2. Authentication

Check authentication status before making authenticated requests:

```javascript
const session = await getSession();
if (!session) {
  router.push('/login');
  return;
}
```

### 3. Rate Limiting

Implement client-side rate limiting and caching:

```javascript
const cache = new Map();

async function fetchWithCache(url) {
  if (cache.has(url)) {
    return cache.get(url);
  }
  
  const data = await fetch(url).then(r => r.json());
  cache.set(url, data);
  
  return data;
}
```

### 4. File Uploads

Validate file size and type before uploading:

```javascript
const maxSize = 5 * 1024 * 1024; // 5MB
const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

if (file.size > maxSize) {
  alert('File too large');
  return;
}

if (!allowedTypes.includes(file.type)) {
  alert('Invalid file type');
  return;
}
```

---

## Examples

### Complete Example: Create a Blog Post

```javascript
async function createBlogPost() {
  try {
    // 1. Generate outline
    const outlineRes = await fetch('/api/ai/generate-outline', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic: 'Next.js Tutorial',
        num_of_keywords: 15
      })
    });
    const { data: { outline } } = await outlineRes.json();
    
    // 2. Generate content
    const eventSource = new EventSource('/api/ai/generate-content');
    let content = '';
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.done) {
        content = data.content;
        eventSource.close();
        continueCreation();
      }
    };
    
    async function continueCreation() {
      // 3. Generate metadata
      const metadataRes = await fetch('/api/ai/generate-metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: 'Next.js Tutorial',
          content: content,
          old_tags: [],
          old_categories: []
        })
      });
      const { data: metadata } = await metadataRes.json();
      
      // 4. Create post
      const postRes = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: metadata.title,
          content: content,
          excerpt: metadata.excerpt,
          status: 'draft'
        })
      });
      const { data: post } = await postRes.json();
      
      console.log('Post created:', post);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}
```

---

## Additional Resources

- [Development Setup Guide](./DEVELOPMENT_SETUP.md)
- [Architecture Documentation](./ARCHITECTURE.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [AI Content Generation Details](./AI_CONTENT_GENERATION.md)

---

## Support

For issues or questions:
1. Check this documentation
2. Review the [Architecture Documentation](./ARCHITECTURE.md)
3. Check the source code in `/pages/api/`
4. Open an issue on GitHub
