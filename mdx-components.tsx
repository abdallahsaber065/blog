import type { MDXComponents } from 'mdx/types';
import Image, { ImageProps } from 'next/image';

// This file allows you to provide custom React components
// to be used in MDX files. You can import and use any
// React component you want, including inline styles,
// components from other libraries, and more.

export function useMDXComponents(components: MDXComponents): MDXComponents {
    return {
        // Allows customizing built-in components, e.g. to add styling.
        h1: ({ children }) => (
            <h1 style={{ color: 'red', fontSize: '48px' }}>{children}</h1>
        ),
        h2: ({ children }) => (
            <h2 style={{ textDecoration: 'none' }}>{children}</h2>
        ),
        h3: ({ children }) => (
            <h3 style={{ textDecoration: 'none' }}>{children}</h3>
        ),
        img: (props) => (
            <Image
                sizes="100vw"
                style={{ width: '100%', height: 'auto' }}
                {...(props as ImageProps)}
            />
        ),
        code: ({ children }) => (
            <code style={{ counterReset: 'line' }}>{children}</code>
        ),
        pre: ({ children }) => (
            <pre
                style={{
                    position: 'relative',
                }}
            >
                {children}
            </pre>
        ),
        'code[data-line]::before': ({ children }) => (
            <span
                style={{
                    counterIncrement: 'line',
                    content: 'counter(line)',
                    display: 'inline-block',
                    width: '1rem',
                    marginRight: '2rem',
                    textAlign: 'right',
                    color: 'gray',
                }}
            >
                {children}
            </span>
        ),
        'code[data-line-numbers-max-digits="2"]::before': ({ children }) => (
            <span style={{ width: '2rem' }}>{children}</span>
        ),
        'code[data-line-numbers-max-digits="3"]::before': ({ children }) => (
            <span style={{ width: '3rem' }}>{children}</span>
        ),
        '[data-highlighted-line]': ({ children }) => (
            <span
                style={{
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    padding: '2px',
                    paddingLeft: '0',
                    paddingRight: '4px',
                    borderRadius: '2px',
                    borderLeft: '2px solid #7B00D3',
                }}
            >
                {children}
            </span>
        ),
        '[data-highlighted-chars]': ({ children }) => (
            <span
                style={{
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    padding: '2px',
                    borderRadius: '2px',
                }}
            >
                {children}
            </span>
        ),
        '[data-rehype-pretty-code-fragment]': ({ children }) => (
            <span style={{ position: 'relative' }}>{children}</span>
        ),
        '[data-rehype-pretty-code-title]': ({ children }) => (
            <span
                style={{
                    position: 'absolute',
                    right: '0',
                    backgroundColor: '#7B00D3',
                    color: '#fff',
                    padding: '4px 8px',
                    fontSize: '1rem',
                    borderEndStartRadius: '4px',
                }}
            >
                {children}
            </span>
        ),
        '[data-rehype-pretty-code-caption]': ({ children }) => (
            <span
                style={{
                    position: 'absolute',
                    top: '100%',
                    width: '100%',
                    textAlign: 'center',
                    fontSize: '1rem',
                    color: '#747474',
                }}
            >
                {children}
            </span>
        ),
        ...components,
    };
}