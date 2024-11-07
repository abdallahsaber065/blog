import type { AppProps } from 'next/app';
import RootLayout from './_layout';
import { StrictMode } from 'react';
import { SessionProvider } from 'next-auth/react';
import { GoogleAnalytics } from '@next/third-parties/google'


function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (

    <SessionProvider session={session}>
      <RootLayout>
        <StrictMode>
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_MEASUREMENT_ID || 'default-ga-id'} />
          <Component {...pageProps} />
        </StrictMode>
      </RootLayout>
    </SessionProvider >

  );
}

export default MyApp;