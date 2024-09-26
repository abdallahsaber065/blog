const iconVersion = 'v1.0.0'; // Define your version number here

export default function manifest() {
  return {
    name: 'Dev Trend',
    short_name: 'Dev Trend',
    description: 'A blog about web development, software engineering, and all Tech related topics.',
    start_url: '/',
    display: 'standalone',
    background_color: '#fff',
    theme_color: '#fff',
    icons: [
      {
        src: `/static/images/icons/favicon-32x32.png?version=${iconVersion}`,
        sizes: '32x32',
        type: 'image/png',
      },
      {
        src: `/static/images/icons/favicon-16x16.png?version=${iconVersion}`,
        sizes: '16x16',
        type: 'image/png',
      },
      {
        src: `/static/images/icons/android-chrome-192x192.png?version=${iconVersion}`,
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: `/static/images/icons/android-chrome-512x512.png?version=${iconVersion}`,
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}