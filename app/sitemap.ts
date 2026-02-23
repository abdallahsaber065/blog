import type { MetadataRoute } from 'next';
import { prisma } from "@/lib/prisma";

export const revalidate = 3600; // revalidate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    try {
        const allBlogs = await prisma.post.findMany({
            select: {
                slug: true,
                updated_at: true,
                created_at: true,
            }
        });

        const siteurl = process.env.NEXT_PUBLIC_BASE_URL;
        if (!siteurl) {
            throw new Error("NEXT_PUBLIC_BASE_URL is not defined");
        }

        const serializedBlogs = allBlogs.map((blog: { slug: string; updated_at: Date; created_at: Date }) => ({
            url: `${siteurl}/blogs/${blog.slug}`,
            lastModified: blog.updated_at ? blog.updated_at.toISOString() : blog.created_at.toISOString(),
            changeFrequency: 'daily' as const,
            priority: 0.7,
        }));

        const staticPages = [
            { url: `${siteurl}/`, lastModified: new Date().toISOString(), changeFrequency: 'daily' as const, priority: 1 },
            { url: `${siteurl}/about`, lastModified: new Date().toISOString(), changeFrequency: 'monthly' as const, priority: 0.8 },
            { url: `${siteurl}/contact`, lastModified: new Date().toISOString(), changeFrequency: 'monthly' as const, priority: 0.8 },
        ];

        return [...serializedBlogs, ...staticPages];
    } catch (error) {
        console.error("Error generating sitemap:", error);
        throw new Error("Failed to generate sitemap");
    }
}
