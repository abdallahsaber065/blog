import type { AppProps } from 'next/app';
import RootLayout from './_layout';
import { StrictMode } from 'react';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <RootLayout>
      <StrictMode>
        <Component {...pageProps} />
      </StrictMode>
    </RootLayout>
  );
}

export default MyApp;