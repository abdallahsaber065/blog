import type { AppProps } from 'next/app';
import RootLayout from './_layout';
import { StrictMode, useEffect, useState } from 'react';
import { SessionProvider } from 'next-auth/react';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import { useRouter } from 'next/router';
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
      <RootLayout>
          {!isExcludedRoute && (
            <div id="google-analytics-container">
              <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_MEASUREMENT_ID || 'default-ga-id'} />
            </div>
          )}
          <Component {...pageProps} />
      </RootLayout>
    </SessionProvider>
  );
}

export default MyApp;