import GoogleAnalytics from '@/components/GoogleAnalytics';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import RootLayout from './_layout';
// pages/_app.js or pages/_app.jsx

import { polyfillPromiseWithResolvers } from "@/utils/polyfilsResolver";

import 'core-js/full/promise/with-resolvers.js';

polyfillPromiseWithResolvers();

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  const router = useRouter();
  const excludedRoutes = ['/login', '/signup', '/admin'];
  const [isExcludedRoute, setIsExcludedRoute] = useState(false);

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      const isExcluded = excludedRoutes.some(route => url.startsWith(route));
      setIsExcludedRoute(isExcluded);
    };

    router.events.on('routeChangeComplete', handleRouteChange);

    // Initial load
    handleRouteChange(router.pathname);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events, excludedRoutes]);

  return (
    <SessionProvider session={session}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        storageKey="theme"
        disableTransitionOnChange={false}
      >
        <RootLayout>
            {!isExcludedRoute && (
              <div id="google-analytics-container">
                <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_MEASUREMENT_ID || 'default-ga-id'} />
              </div>
            )}
            <Component {...pageProps} />
        </RootLayout>
      </ThemeProvider>
    </SessionProvider>
  );
}

export default MyApp;