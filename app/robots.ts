import type { MetadataRoute } from 'next'

export const revalidate = 86400; // revalidate every day

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: '/private/',
        },
        sitemap: `${process.env.NEXT_PUBLIC_BASE_URL}/sitemap.xml`
    }
}