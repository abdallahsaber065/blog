type SiteConfig = {
    envFile: string;
    siteName: string;
    siteDescription: string;
    siteUrl: string;
    logo: string;
    dark_logo: string;
};

const getEnvConfig = (): SiteConfig => {
    const isSiteCollage = process.env.NEXT_PUBLIC_SITE_TYPE === 'collage';
    const isDev = process.env.NODE_ENV === 'development';

    if (isSiteCollage) {
        const baseUrl = isDev ? 'http://localhost:3001' : 'https://collage.devtrend.tech';
        return {
            envFile: '.env.collage',
            siteName: 'Collage DevTrend',
            siteDescription: 'A blog for collage students about technology and development',
            siteUrl: baseUrl,
            logo: `${baseUrl}/static/images/logo.png`,
            dark_logo: `${baseUrl}/static/images/logo-dark.png`,
        };
    }

    const baseUrl = isDev ? 'http://localhost:3000' : 'https://devtrend.tech';
    return {
        envFile: '.env',
        siteName: 'DevTrend',
        siteDescription: 'A blog about web development and software engineering',
        siteUrl: baseUrl,
        logo: `${baseUrl}/static/images/logo.png`,
        dark_logo: `${baseUrl}/static/images/logo-dark.png`,
    };
};

export default getEnvConfig;