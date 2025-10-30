import "../public/styles/globals.css";
import { cx } from "@/lib";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import siteMetadata from "@/lib/siteMetaData";
import { ReactNode } from 'react';
import ClientProvider from './ClientProvider';

export const metadata = {
    metadataBase: new URL(siteMetadata.siteUrl),
    title: {
        template: `%s | ${siteMetadata.title}`,
        default: siteMetadata.title,
    },
    description: siteMetadata.description,
    openGraph: {
        title: siteMetadata.title,
        description: siteMetadata.description,
        url: siteMetadata.siteUrl,
        siteName: siteMetadata.title,
        images: [siteMetadata.socialBanner],
        locale: "en_US",
        type: "website",
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            noimageindex: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
    twitter: {
        card: "summary_large_image",
        title: siteMetadata.title,
        images: [siteMetadata.socialBanner],
    },
};

export default function RootLayout({ children}: { children: ReactNode}) {
    return (
        <html lang="en">
            <head>
                <link rel="manifest" href="/manifest.json" />
                <link rel="icon" href="/static/images/icons/favicon.ico" />
                <link rel="apple-touch-icon" href="/static/images/icons/apple-touch-icon.png" />
                <link rel="icon" type="image/png" sizes="192x192" href="/static/images/icons/android-chrome-192x192.png" />
                <link rel="icon" type="image/png" sizes="512x512" href="/static/images/icons/android-chrome-512x512.png" />
                <link rel="icon" type="image/png" sizes="16x16" href="/static/images/icons/favicon-16x16.png" />
                <link rel="icon" type="image/png" sizes="32x32" href="/static/images/icons/favicon-32x32.png" />
                <link rel="mask-icon" href="/static/images/icons/safari-pinned-tab.svg" color="#5bbad5" />
                <meta name="msapplication-TileImage" content="/static/images/icons/mstile-150x150.png" />
                <script rel='preload'
                    dangerouslySetInnerHTML={{
                        __html: `
              (function() {
                const preferDarkQuery = '(prefers-color-scheme: dark)';
                const storageKey = 'theme';
                try {
                  const userPref = localStorage.getItem(storageKey);
                  const prefersDark = window.matchMedia(preferDarkQuery).matches;
                  
                  if (userPref === 'dark' || (userPref === 'system' && prefersDark) || (!userPref && prefersDark)) {
                    document.documentElement.classList.add('dark');
                  } else if (userPref === 'light' || (userPref === 'system' && !prefersDark) || (!userPref && !prefersDark)) {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
                    }}
                />
            </head>
            <body className={cx("font-mr bg-light dark:bg-dark")} style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                <ClientProvider>
                    <Header />
                    {children}
                    <Footer />
                </ClientProvider>
            </body>
        </html>
    );
}