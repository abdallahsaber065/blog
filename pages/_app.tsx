import type { AppProps } from 'next/app';
import RootLayout from './_layout';
import { StrictMode } from 'react';
import { SessionProvider } from 'next-auth/react';

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (

    <SessionProvider session={session}>
      <RootLayout>
        <StrictMode>
          <Component {...pageProps} />
        </StrictMode>
      </RootLayout>
    </SessionProvider >

  );
}

export default MyApp;