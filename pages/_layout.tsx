import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { cx } from "@/lib";
import siteMetadata from "@/lib/siteMetaData";
import Head from 'next/head';
import { useRouter } from 'next/router';
import { ReactNode } from 'react';
import { Toaster } from "react-hot-toast";
import "../public/styles/globals.css";

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

export default function RootLayout({ children }: { children: ReactNode }) {
  const router = useRouter();

  // Hide footer for admin pages and chatbot
  const hideFooterRoutes = ['/admin', '/chatbot'];
  const shouldHideFooter = hideFooterRoutes.some(route => router.pathname.startsWith(route));

  return (
    <div
      className={cx(
        "font-mr bg-light dark:bg-dark"
      )}
      style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
    >
      <Head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/static/images/icons/favicon.ico" />
        <link rel="apple-touch-icon" href="/static/images/icons/apple-touch-icon.png" />
        {/* android-chrome */}
        <link rel="icon" type="image/png" sizes="192x192" href="/static/images/icons/android-chrome-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/static/images/icons/android-chrome-512x512.png" />
        {/* favicon 16 and 32 */}
        <link rel="icon" type="image/png" sizes="16x16" href="/static/images/icons/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/static/images/icons/favicon-32x32.png" />
        {/* safari-pinned-tab */}
        <link rel="mask-icon" href="/static/images/icons/safari-pinned-tab.svg" color="#5bbad5" />
        {/* mstile 150x150 */}
        <meta name="msapplication-TileImage" content="/static/images/icons/mstile-150x150.png" />
      </Head>
      <Header />
      <Toaster
        position="top-right"
        containerStyle={{
          top: '5rem', // This will position it below the header
          right: '1rem',
        }}
      />
      {children}
      {!shouldHideFooter && <Footer />}
    </div>
  );
}