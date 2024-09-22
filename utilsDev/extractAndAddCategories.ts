import { PrismaClient } from '@prisma/client';
import GithubSlugger from 'github-slugger';

const prisma = new PrismaClient();
const slugger = new GithubSlugger();

async function extractAndAddCategories() {
  try {
    // Fetch all posts
    const allPosts = await prisma.post.findMany({
      include: {
        category: true,
      },
    });

    // Extract unique categories
    const uniqueCategories = new Set<string>();
    allPosts.forEach(post => {
      if (post.category && post.category.name) {
        uniqueCategories.add(post.category.name);
      }
    });

    // Add unique categories to the Category table
    const addCategoryPromises = Array.from(uniqueCategories).map(async categoryName => {
      const slug = slugger.slug(categoryName);
      return prisma.category.upsert({
        where: { slug },
        update: {},
        create: {
          name: categoryName,
          slug,
          description: `Category for ${categoryName}`,
        },
      });
    });

    // Execute all add category operations
    await Promise.all(addCategoryPromises);

    console.log('Categories extracted and added successfully.');
  } catch (error) {
    console.error('Error extracting and adding categories:', error);
  } finally {
    await prisma.$disconnect();
  }
}

extractAndAddCategories();