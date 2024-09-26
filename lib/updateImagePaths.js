import { prisma } from '@/lib/prisma';

async function updateImagePaths() {
  try {
    // Fetch all posts
    const allBlogs = await prisma.post.findMany();

    // Update each post's featured_image_url
    const updatePromises = allBlogs.map(blog => {
      const updatedImageUrl = blog.featured_image_url?.replace("../../public", "") || blog.featured_image_url;
      return prisma.post.update({
        where: { id: blog.id },
        data: { featured_image_url: updatedImageUrl },
      });
    });

    // Execute all update operations
    await Promise.all(updatePromises);

    console.log('Image paths updated successfully.');
  } catch (error) {
    console.error('Error updating image paths:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateImagePaths();