const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const slugger = require('slug');
import { prisma } from '@/lib/prisma';


async function main() {

  // ../content
  const contentDir = path.join(__dirname, '..', 'content');
  const directories = fs.readdirSync(contentDir);

  for (const dir of directories) {
    const filePath = path.join(contentDir, dir, 'index.mdx');
    if (!fs.existsSync(filePath)) {
      console.warn(`File not found: ${filePath}`);
      continue;
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(fileContent);

    // Check if the author exists, if not create a placeholder author
    let author = await prisma.user.findUnique({
      where: { username: data.author },
    });

    if (!author) {
      author = await prisma.user.create({
        data: {
          username: data.author,
          email: `${data.author}@example.com`,
          password: 'placeholderpassword',
          first_name: 'FirstName',
          last_name: 'LastName',
          bio: 'This is a placeholder bio.',
          profile_image_url: '/default-profile.png',
        },
      });
    }

    // Check if the category exists, if not create it
    let category = await prisma.category.findUnique({
      where: { name: data.category || 'Uncategorized' },
    });

    if (!category) {
      category = await prisma.category.create({
        data: {
          name: data.category || 'Uncategorized',
          slug: slugger(data.category || 'Uncategorized'),
        },
      });
    }

    // Check if the tags exist, if not create them
    const tags = [];
    for (const tagName of data.tags || []) {
      let tag = await prisma.tag.findUnique({
        where: { name: tagName },
      });

      if (!tag) {
        tag = await prisma.tag.create({
          data: {
            name: tagName,
            slug: slugger(tagName),
          },
        });
      }
      tags.push(tag);
    }

    // Create the post
    await prisma.post.create({
      data: {
        title: data.title,
        slug: slugger(data.title),
        content: content,
        excerpt: data.description,
        author_id: author.id,
        category_id: category.id,
        status: data.isPublished ? 'published' : 'draft',
        featured_image_url: data.image,
        published_at: new Date(data.publishedAt),
        tags: {
          connect: tags.map(tag => ({ id: tag.id })),
        },
      },
    });
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });