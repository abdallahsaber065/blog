type SiteConfig = {
    envFile: string;
    siteName: string;
    siteDescription: string;
    siteUrl: string;
    logo: string;
    dark_logo: string;
};

const getEnvConfig = (): SiteConfig => {
    const isSiteCollege = process.env.NEXT_PUBLIC_SITE_TYPE === 'college';
    const isDev = process.env.NODE_ENV === 'development';

    if (isSiteCollege) {
        const baseUrl = isDev ? 'http://localhost:3001' : 'https://college.devtrend.tech';
        return {
            envFile: '.env.college',
            siteName: 'College DevTrend',
            siteDescription: 'A blog for college students about technology and development',
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