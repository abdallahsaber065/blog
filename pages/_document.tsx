import { GoogleAnalytics } from '@next/third-parties/google';
import Document, { DocumentContext, Head, Html, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <Html lang="en">
        <Head>
          
          {/* <link rel="preload" href="/fonts/Inter.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
          <link rel="preload" href="/fonts/Manrope.woff2" as="font" type="font/woff2" crossOrigin="anonymous" /> */}
          <script 
            dangerouslySetInnerHTML={{
              __html: `
                (function() {
                  try {
                    const storageKey = 'theme';
                    const prefersDarkQuery = '(prefers-color-scheme: dark)';
                    const userPref = localStorage.getItem(storageKey);
                    const prefersDark = window.matchMedia(prefersDarkQuery).matches;
                    
                    // If user has explicitly set dark or light, use that
                    if (userPref === 'dark') {
                      document.documentElement.classList.add('dark');
                    } else if (userPref === 'light') {
                      document.documentElement.classList.remove('dark');
                    } else {
                      // Default to system preference
                      if (prefersDark) {
                        document.documentElement.classList.add('dark');
                      } else {
                        document.documentElement.classList.remove('dark');
                      }
                    }
                  } catch (e) {}
                })();
              `,
            }}
          />
        </Head>
        <body className="font-mr bg-light dark:bg-dark">
          <Main />
          <NextScript />
        </body>
        <GoogleAnalytics gaId='G-HN8NHQL8NH' />
      </Html>
    );
  }
}

export default MyDocument;