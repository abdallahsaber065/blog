// components/RenderMdxDev.tsx
'use client';

import { MDXRemote } from 'next-mdx-remote';
import { MDXRemoteSerializeResult } from 'next-mdx-remote/dist/types';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useState } from 'react';
import { FaExpand, FaCompress } from 'react-icons/fa';
import BlogPreview from '@/components/Blog/BlogPreview';

interface RenderMdxProps {
    mdxText: string;
    mdxSource: MDXRemoteSerializeResult;
    additionalComponents?: Record<string, React.FC>;
}

const RenderMdxDev: React.FC<RenderMdxProps> = ({ mdxText, mdxSource, additionalComponents }) => {
    const [isFullScreen, setIsFullScreen] = useState(false);

    const handleToggleFullScreen = () => {
        setIsFullScreen(!isFullScreen);
    };

    return (
        <ErrorBoundary>
            <div
                className={`
                    ${isFullScreen
                        ? 'fixed inset-0 z-50 bg-white dark:bg-dark'
                        : 'relative'
                    } overflow-auto`
                }
                style={{
                    height: isFullScreen ? '100vh' : '500px',
                }}
            >
                <div
                    className="sticky top-0 flex items-center justify-end border-b px-4 dark:border-dark bg-white dark:bg-dark z-10"
                    style={{ height: '40px' }}
                >
                    <button onClick={handleToggleFullScreen}>
                        {isFullScreen ? (
                            <FaCompress className="text-dark dark:text-white" />
                        ) : (
                            <FaExpand className="text-dark dark:text-white" />
                        )}
                    </button>
                </div>
                {isFullScreen ? (
                    <BlogPreview mdxText={mdxText} />
                ) : (
                    <div
                        className={`
                            col-span-12 lg:col-span-8 font-in prose sm:prose-base md:prose-lg max-w-max
                            prose-blockquote:bg-accent/20 
                            prose-blockquote:p-2
                            prose-blockquote:px-6
                            prose-blockquote:border-accent
                            prose-blockquote:not-italic
                            prose-blockquote:rounded-r-lg

                            prose-li:marker:text-accent

                            dark:prose-invert
                            dark:prose-blockquote:border-accentDark
                            dark:prose-blockquote:bg-accentDark/20
                            dark:prose-li:marker:text-accentDark

                            first-letter:text-3xl
                            sm:first-letter:text-5xl
                            text-gray 
                            dark:text-lightgray

                            // Custom styles for light theme
                            prose-h1:text-dark
                            prose-h2:text-dark
                            prose-h3:text-dark
                            prose-h4:text-dark
                            prose-h5:text-dark
                            prose-h6:text-dark
                            dark:prose-h1:text-light
                            dark:prose-h2:text-light
                            dark:prose-h3:text-light
                            dark:prose-h4:text-light
                            dark:prose-h5:text-light
                            dark:prose-h6:text-light
                            prose-blockquote:text-dark
                            dark:prose-blockquote:text-light
                            prose-strong:text-dark
                            dark:prose-strong:text-light

                            // Custom styles for links
                            prose-a:text-accent
                            dark:prose-a:text-accentDark
                            ${isFullScreen ? 'flex justify-center' : ''}
                            `}
                        style={{ height: '100%', paddingTop: '40px' }}
                    >
                        <MDXRemote
                            {...mdxSource}
                            components={{
                                ...additionalComponents,
                            }}
                        />
                    </div>
                )}
            </div>
        </ErrorBoundary>
    );
};

export default RenderMdxDev;