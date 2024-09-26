import Document, { Html, Head, Main, NextScript, DocumentContext } from 'next/document';

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <Html lang="en">
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
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function() {
                  const preferDarkQuery = '(prefers-color-scheme: dark)';
                  const storageKey = 'theme';
                  const userPref = localStorage.getItem(storageKey);
                  const prefersDark = window.matchMedia(preferDarkQuery).matches;
                  if (userPref === 'dark' || (!userPref && prefersDark)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                })();
              `,
            }}
          />
        </Head>
        <body className="font-mr bg-light dark:bg-dark">
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;