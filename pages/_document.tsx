import { GoogleAnalytics } from '@next/third-parties/google';
import Document, { DocumentContext, Head, Html, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <Html lang="en" className="dark">
        <Head>

          {/* <link rel="preload" href="/fonts/Inter.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
          <link rel="preload" href="/fonts/Manrope.woff2" as="font" type="font/woff2" crossOrigin="anonymous" /> */}
          {/* Force dark mode - light mode temporarily disabled */}
          <script
            dangerouslySetInnerHTML={{
              __html: `document.documentElement.classList.add('dark');`,
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