import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seeding...');

    // Clear existing data (in correct order due to foreign keys)
    await prisma.postView.deleteMany({});
    await prisma.postPermission.deleteMany({});
    await prisma.comment.deleteMany({});
    await prisma.post.deleteMany({});
    await prisma.mediaLibrary.deleteMany({});
    await prisma.fileLibrary.deleteMany({});
    await prisma.newsletterSubscription.deleteMany({});
    await prisma.tag.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.setting.deleteMany({});

    console.log('✅ Cleared existing data');

    // Create Users (Writers/Authors)
    const users = await Promise.all([
        prisma.user.create({
            data: {
                username: 'john_doe',
                email: 'john@example.com',
                password: await bcryptjs.hash('Password123!', 10),
                first_name: 'John',
                last_name: 'Doe',
                bio: 'Full-stack developer and tech enthusiast. Passionate about sharing knowledge.',
                profile_image_url: 'http://localhost:3000/static/default-avatar.png',
                role: 'writer',
                email_verified: true,
            },
        }),
        prisma.user.create({
            data: {
                username: 'jane_smith',
                email: 'jane@example.com',
                password: await bcryptjs.hash('Password123!', 10),
                first_name: 'Jane',
                last_name: 'Smith',
                bio: 'UI/UX Designer and frontend developer. Coffee enthusiast.',
                profile_image_url: 'http://localhost:3000/static/default-avatar.png',
                role: 'writer',
                email_verified: true,
            },
        }),
        prisma.user.create({
            data: {
                username: 'admin_user',
                email: 'admin@example.com',
                password: await bcryptjs.hash('AdminPassword123!', 10),
                first_name: 'Admin',
                last_name: 'User',
                bio: 'Blog administrator',
                profile_image_url: 'http://localhost:3000/static/default-avatar.png',
                role: 'admin',
                email_verified: true,
            },
        }),
        prisma.user.create({
            data: {
                username: 'reader_user',
                email: 'reader@example.com',
                password: await bcryptjs.hash('ReaderPass123!', 10),
                first_name: 'Regular',
                last_name: 'Reader',
                bio: 'A passionate blog reader',
                profile_image_url: 'http://localhost:3000/static/default-avatar.png',
                role: 'reader',
                email_verified: true,
            },
        }),
    ]);

    console.log(`✅ Created ${users.length} users`);

    // Create Categories
    const categories = await Promise.all([
        prisma.category.create({
            data: {
                name: 'Web Development',
                slug: 'web-development',
                description: 'Articles about web development, frameworks, and best practices.',
            },
        }),
        prisma.category.create({
            data: {
                name: 'Mobile Development',
                slug: 'mobile-development',
                description: 'Articles about iOS, Android, and cross-platform mobile development.',
            },
        }),
        prisma.category.create({
            data: {
                name: 'DevOps & Cloud',
                slug: 'devops-cloud',
                description: 'Articles about cloud infrastructure, CI/CD, and deployment strategies.',
            },
        }),
        prisma.category.create({
            data: {
                name: 'Design & UX',
                slug: 'design-ux',
                description: 'Articles about UI/UX design principles and tools.',
            },
        }),
        prisma.category.create({
            data: {
                name: 'AI & Machine Learning',
                slug: 'ai-ml',
                description: 'Articles about artificial intelligence and machine learning.',
            },
        }),
    ]);

    console.log(`✅ Created ${categories.length} categories`);

    // Create Tags
    const tags = await Promise.all([
        prisma.tag.create({
            data: {
                name: 'React',
                slug: 'react',
            },
        }),
        prisma.tag.create({
            data: {
                name: 'Next.js',
                slug: 'nextjs',
            },
        }),
        prisma.tag.create({
            data: {
                name: 'Node.js',
                slug: 'nodejs',
            },
        }),
        prisma.tag.create({
            data: {
                name: 'TypeScript',
                slug: 'typescript',
            },
        }),
        prisma.tag.create({
            data: {
                name: 'Docker',
                slug: 'docker',
            },
        }),
        prisma.tag.create({
            data: {
                name: 'PostgreSQL',
                slug: 'postgresql',
            },
        }),
        prisma.tag.create({
            data: {
                name: 'JavaScript',
                slug: 'javascript',
            },
        }),
        prisma.tag.create({
            data: {
                name: 'Tailwind CSS',
                slug: 'tailwind',
            },
        }),
    ]);

    console.log(`✅ Created ${tags.length} tags`);

    // Create Posts (Blogs)
    const posts = await Promise.all([
        prisma.post.create({
            data: {
                title: 'Getting Started with Next.js 16',
                slug: 'getting-started-nextjs-16',
                content: `
# Getting Started with Next.js 16

Next.js 16 brings exciting new features and improvements to the React framework. In this comprehensive guide, we'll explore the key features and best practices.

## What's New in Next.js 16

- **Improved Performance**: Better caching and optimization strategies
- **Enhanced DX**: Improved developer experience with better error messages
- **New Patterns**: Introduction of new routing and data fetching patterns

## Setting Up a Project

\`\`\`bash
npx create-next-app@latest my-app
cd my-app
npm run dev
\`\`\`

## Key Concepts

### App Router
The Next.js App Router is the modern way to build applications with Next.js.

### Data Fetching
With the new data fetching patterns, you can fetch data more efficiently in your components.

### Static and Dynamic Rendering
Understanding when to use static and dynamic rendering is crucial for performance optimization.

## Conclusion

Next.js 16 is a powerful framework that makes it easy to build fast, scalable web applications. Start exploring its features today!
        `,
                excerpt: 'Learn how to get started with Next.js 16, the latest version of the React framework with powerful features and improvements.',
                author_id: users[0].id,
                category_id: categories[0].id,
                status: 'published',
                featured_image_url: 'http://localhost:3000/static/next-js-hero.png',
                views: 245,
                reading_time: 8,
                published_at: new Date('2026-02-10'),
                outline: JSON.stringify([
                    { title: 'What\'s New in Next.js 16', level: 2 },
                    { title: 'Setting Up a Project', level: 2 },
                    { title: 'Key Concepts', level: 2 },
                ]),
                tags: {
                    connect: [{ id: tags[1].id }, { id: tags[2].id }],
                },
            },
        }),
        prisma.post.create({
            data: {
                title: 'Mastering TypeScript for React Developers',
                slug: 'mastering-typescript-react',
                content: `
# Mastering TypeScript for React Developers

TypeScript has become the de facto standard for developing type-safe React applications. This guide will help you master TypeScript in the context of React development.

## Why TypeScript?

- **Type Safety**: Catch errors at compile time, not runtime
- **Better Tooling**: IDE support for better autocomplete and refactoring
- **Self-documenting Code**: Types serve as documentation
- **Easier Refactoring**: Confident refactoring with type checking

## Setting Up TypeScript

TypeScript is easy to set up in your React project. Modern Create React App and Next.js projects come with TypeScript support built-in.

## React Patterns with TypeScript

### Functional Components
\`\`\`tsx
interface Props {
  name: string;
  age?: number;
}

const MyComponent: React.FC<Props> = ({ name, age }) => {
  return <div>Hello, {name}!</div>;
};
\`\`\`

### Custom Hooks
\`\`\`tsx
const useCounter = (initialValue: number = 0): [number, () => void] => {
  const [count, setCount] = useState(initialValue);
  const increment = () => setCount(c => c + 1);
  return [count, increment];
};
\`\`\`

## Best Practices

1. **Strict Mode**: Enable strict mode in your tsconfig.json
2. **Avoid Any**: Use 'any' only as a last resort
3. **Use Proper Types**: Be specific with your types
4. **Utility Types**: Leverage TypeScript's utility types

## Conclusion

TypeScript significantly improves the quality and maintainability of React applications. Invest time in learning it, and you'll see the benefits immediately.
        `,
                excerpt: 'Discover how to leverage TypeScript in your React projects for better type safety, tooling, and developer experience.',
                author_id: users[1].id,
                category_id: categories[0].id,
                status: 'published',
                featured_image_url: 'http://localhost:3000/static/typescript-hero.png',
                views: 312,
                reading_time: 12,
                published_at: new Date('2026-02-08'),
                outline: JSON.stringify([
                    { title: 'Why TypeScript?', level: 2 },
                    { title: 'Setting Up TypeScript', level: 2 },
                    { title: 'React Patterns with TypeScript', level: 2 },
                ]),
                tags: {
                    connect: [{ id: tags[3].id }, { id: tags[0].id }],
                },
            },
        }),
        prisma.post.create({
            data: {
                title: 'Docker for Beginners: A Complete Guide',
                slug: 'docker-beginners-guide',
                content: `
# Docker for Beginners: A Complete Guide

Docker has revolutionized the way applications are deployed and scaled. This guide will introduce you to Docker fundamentals.

## What is Docker?

Docker is a containerization platform that allows you to package applications and their dependencies into isolated containers.

## Key Concepts

### Images
Docker images are blueprints for containers. They contain everything needed to run an application.

### Containers
Containers are running instances of Docker images.

### Dockerfile
The Dockerfile is a text file containing instructions to build a Docker image.

## Getting Started

### Installation
Download Docker Desktop from the official website and follow the installation instructions.

### Your First Container
\`\`\`bash
docker run -d -p 8080:80 nginx
\`\`\`

### Building an Image
\`\`\`dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install
CMD ["npm", "start"]
\`\`\`

## Docker Compose

Docker Compose allows you to define and run multi-container applications:

\`\`\`yaml
version: '3.8'
services:
  web:
    build: .
    ports:
      - "3000:3000"
  db:
    image: postgres:15
    environment:
      POSTGRES_PASSWORD: secret
\`\`\`

## Best Practices

1. **Use Official Images**: Always use official base images
2. **Minimize Layers**: Reduce the number of layers in your image
3. **Security**: Never run containers as root
4. **Keep Images Small**: Use Alpine Linux for smaller images

## Conclusion

Docker simplifies deployment and ensures consistency across environments. Master Docker and become a more effective developer!
        `,
                excerpt: 'Learn Docker from scratch. This comprehensive guide covers containers, images, Dockerfiles, and Docker Compose with practical examples.',
                author_id: users[0].id,
                category_id: categories[2].id,
                status: 'published',
                featured_image_url: 'http://localhost:3000/static/docker-hero.png',
                views: 456,
                reading_time: 15,
                published_at: new Date('2026-02-05'),
                outline: JSON.stringify([
                    { title: 'What is Docker?', level: 2 },
                    { title: 'Key Concepts', level: 2 },
                    { title: 'Getting Started', level: 2 },
                    { title: 'Docker Compose', level: 2 },
                ]),
                tags: {
                    connect: [{ id: tags[4].id }, { id: tags[5].id }],
                },
            },
        }),
        prisma.post.create({
            data: {
                title: 'UI Design Principles for Modern Web Applications',
                slug: 'ui-design-principles',
                content: `
# UI Design Principles for Modern Web Applications

Great UI design is not just about making things look pretty. It's about creating intuitive, accessible, and user-friendly interfaces.

## Core Principles

### 1. Clarity
Users should immediately understand how to interact with your interface. Avoid unnecessary complexity.

### 2. Consistency
Maintain consistency across your application in colors, typography, spacing, and interaction patterns.

### 3. Hierarchy
Use visual hierarchy to guide users through your interface. Important elements should stand out.

### 4. Feedback
Provide immediate feedback to user actions. Users need to know that their action was registered.

### 5. Minimalism
Remove unnecessary elements. Every element should serve a purpose.

## Color Psychology

Colors evoke emotions and can significantly impact user behavior. Choose colors strategically for your application.

## Typography

Good typography improves readability and aesthetics. Follow these guidelines:
- Use readable fonts
- Maintain proper contrast
- Use appropriate font sizes
- Keep line lengths manageable

## Accessibility

Accessibility is not optional. Design for everyone:
- Ensure proper contrast ratios
- Provide alt text for images
- Use semantic HTML
- Test with screen readers

## Tools and Resources

- **Figma**: Collaborative design tool
- **Adobe XD**: Professional design software
- **Sketch**: Vector-based design tool
- **Material Design**: Google's design system

## Conclusion

Good UI design is an art and a science. By following these principles and continuously learning, you can create interfaces that users love.
        `,
                excerpt: 'Explore essential UI design principles including clarity, consistency, hierarchy, feedback, and minimalism for creating beautiful web applications.',
                author_id: users[1].id,
                category_id: categories[3].id,
                status: 'published',
                featured_image_url: 'http://localhost:3000/static/ui-design-hero.png',
                views: 189,
                reading_time: 10,
                published_at: new Date('2026-02-01'),
                outline: JSON.stringify([
                    { title: 'Core Principles', level: 2 },
                    { title: 'Color Psychology', level: 2 },
                    { title: 'Typography', level: 2 },
                    { title: 'Accessibility', level: 2 },
                ]),
                tags: {
                    connect: [{ id: tags[7].id }],
                },
            },
        }),
        prisma.post.create({
            data: {
                title: 'Introduction to Machine Learning with Python',
                slug: 'intro-machine-learning-python',
                content: `
# Introduction to Machine Learning with Python

Machine Learning is transforming industries and creating new opportunities for developers. This guide introduces ML concepts and practical implementation.

## What is Machine Learning?

Machine Learning is a subset of artificial intelligence that enables systems to learn and improve from experience without being explicitly programmed.

## Types of Machine Learning

### 1. Supervised Learning
Learning from labeled data. Used for classification and regression tasks.

### 2. Unsupervised Learning
Learning from unlabeled data. Used for clustering and dimensionality reduction.

### 3. Reinforcement Learning
Learning through interaction with an environment. Used in game AI and robotics.

## Getting Started with Python

### Essential Libraries
- **NumPy**: Numerical computing
- **Pandas**: Data manipulation
- **Scikit-learn**: Machine learning algorithms
- **Matplotlib**: Visualization
- **TensorFlow/PyTorch**: Deep learning

### Your First ML Model

\`\`\`python
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier

# Load data
iris = load_iris()
X_train, X_test, y_train, y_test = train_test_split(
    iris.data, iris.target, test_size=0.2
)

# Train model
model = RandomForestClassifier()
model.fit(X_train, y_train)

# Evaluate
accuracy = model.score(X_test, y_test)
print(f"Accuracy: {accuracy}")
\`\`\`

## Key Concepts

### Features and Labels
Features are input variables, labels are target variables you're trying to predict.

### Training and Testing
Always split your data to properly evaluate model performance.

### Overfitting and Underfitting
Balance model complexity to avoid overfitting or underfitting.

## Best Practices

1. **Data Quality**: Garbage in, garbage out
2. **Feature Engineering**: Create meaningful features
3. **Model Validation**: Use cross-validation
4. **Hyperparameter Tuning**: Optimize model parameters

## Conclusion

Machine Learning is an exciting field with endless possibilities. Start building models today and unlock new career opportunities!
        `,
                excerpt: 'Get started with Machine Learning using Python. Learn core concepts, key libraries, and build your first ML model with practical examples.',
                author_id: users[0].id,
                category_id: categories[4].id,
                status: 'published',
                featured_image_url: 'http://localhost:3000/static/ml-hero.png',
                views: 567,
                reading_time: 14,
                published_at: new Date('2026-01-28'),
                outline: JSON.stringify([
                    { title: 'What is Machine Learning?', level: 2 },
                    { title: 'Types of Machine Learning', level: 2 },
                    { title: 'Getting Started with Python', level: 2 },
                    { title: 'Key Concepts', level: 2 },
                ]),
                tags: {
                    connect: [{ id: tags[6].id }],
                },
            },
        }),
        prisma.post.create({
            data: {
                title: 'Draft: Advanced React Performance Optimization',
                slug: 'advanced-react-performance',
                content: `
# Advanced React Performance Optimization

[This is a draft article about advanced React performance techniques...]

Performance optimization is crucial for creating fast, responsive React applications.

## Key Areas

- Memoization with useMemo and useCallback
- Code splitting and lazy loading
- Virtual scrolling
- Suspense and concurrent rendering
        `,
                excerpt: 'Draft article on advanced React performance optimization techniques.',
                author_id: users[1].id,
                category_id: categories[0].id,
                status: 'draft',
                featured_image_url: null,
                reading_time: 0,
                outline: JSON.stringify([]),
                tags: {
                    connect: [{ id: tags[0].id }],
                },
            },
        }),
    ]);

    console.log(`✅ Created ${posts.length} posts`);

    // Create Comments
    const comments = await Promise.all([
        prisma.comment.create({
            data: {
                post_id: posts[0].id,
                author_name: 'Alice Johnson',
                author_email: 'alice@example.com',
                content: 'Great article! Really helped me understand Next.js 16 better.',
                status: 'approved',
            },
        }),
        prisma.comment.create({
            data: {
                post_id: posts[0].id,
                author_name: 'Bob Wilson',
                author_email: 'bob@example.com',
                content: 'Thanks for the detailed explanation on the App Router!',
                status: 'approved',
            },
        }),
        prisma.comment.create({
            data: {
                post_id: posts[1].id,
                author_name: 'Carol Davis',
                author_email: 'carol@example.com',
                content: 'The TypeScript patterns you showed are really helpful.',
                status: 'approved',
            },
        }),
        prisma.comment.create({
            data: {
                post_id: posts[2].id,
                author_name: 'David Miller',
                author_email: 'david@example.com',
                content: 'I needed this Docker guide. Waiting for more advanced topics!',
                status: 'pending',
            },
        }),
    ]);

    console.log(`✅ Created ${comments.length} comments`);

    // Create Post Views
    const postViews = await Promise.all([
        prisma.postView.create({
            data: {
                post_id: posts[0].id,
                viewer_ip: '192.168.1.1',
            },
        }),
        prisma.postView.create({
            data: {
                post_id: posts[0].id,
                viewer_ip: '192.168.1.2',
            },
        }),
        prisma.postView.create({
            data: {
                post_id: posts[1].id,
                viewer_ip: '192.168.1.1',
            },
        }),
        prisma.postView.create({
            data: {
                post_id: posts[2].id,
                viewer_ip: '192.168.1.3',
            },
        }),
    ]);

    console.log(`✅ Created ${postViews.length} post views`);

    // Create Newsletter Subscriptions
    const subscriptions = await Promise.all([
        prisma.newsletterSubscription.create({
            data: {
                email: 'subscriber1@example.com',
                user_ip: '192.168.1.100',
            },
        }),
        prisma.newsletterSubscription.create({
            data: {
                email: 'subscriber2@example.com',
                user_ip: '192.168.1.101',
            },
        }),
        prisma.newsletterSubscription.create({
            data: {
                email: 'subscriber3@example.com',
                user_ip: '192.168.1.102',
            },
        }),
    ]);

    console.log(`✅ Created ${subscriptions.length} newsletter subscriptions`);

    // Create Post Permissions
    const permissions = await Promise.all([
        prisma.postPermission.create({
            data: {
                post_id: posts[0].id,
                user_id: users[0].id,
            },
        }),
        prisma.postPermission.create({
            data: {
                post_id: posts[0].id,
                role: 'writer',
            },
        }),
        prisma.postPermission.create({
            data: {
                post_id: posts[1].id,
                user_id: users[1].id,
            },
        }),
    ]);

    console.log(`✅ Created ${permissions.length} post permissions`);

    // Create Settings
    const settings = await Promise.all([
        prisma.setting.create({
            data: {
                setting_name: 'site_title',
                setting_value: 'DevTrend Blog',
            },
        }),
        prisma.setting.create({
            data: {
                setting_name: 'site_description',
                setting_value: 'A modern blog platform for tech enthusiasts',
            },
        }),
        prisma.setting.create({
            data: {
                setting_name: 'posts_per_page',
                setting_value: '10',
            },
        }),
        prisma.setting.create({
            data: {
                setting_name: 'enable_comments',
                setting_value: 'true',
            },
        }),
    ]);

    console.log(`✅ Created ${settings.length} settings`);

    console.log(`
  ╔════════════════════════════════════════╗
  ║     🎉 Database Seeding Complete 🎉     ║
  ╚════════════════════════════════════════╝

  📊 Summary:
  - Users: ${users.length}
  - Categories: ${categories.length}
  - Tags: ${tags.length}
  - Posts: ${posts.length}
  - Comments: ${comments.length}
  - Post Views: ${postViews.length}
  - Newsletter Subscriptions: ${subscriptions.length}
  - Post Permissions: ${permissions.length}
  - Settings: ${settings.length}

  🔐 Admin Credentials:
  - Username: admin_user
  - Email: admin@example.com
  - Password: AdminPassword123!

  📝 Writer Credentials:
  - Username: john_doe
  - Email: john@example.com
  - Password: Password123!

  - Username: jane_smith
  - Email: jane@example.com
  - Password: Password123!

  👤 Reader Credentials:
  - Username: reader_user
  - Email: reader@example.com
  - Password: ReaderPass123!
  `);
}

main()
    .catch((e) => {
        console.error('❌ Error during seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
