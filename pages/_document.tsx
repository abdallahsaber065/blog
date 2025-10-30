import Document, { Html, Head, Main, NextScript, DocumentContext } from 'next/document';
import { GoogleAnalytics } from '@next/third-parties/google'

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