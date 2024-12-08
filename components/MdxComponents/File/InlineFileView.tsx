import React, { useState, useEffect } from 'react';
import { FiDownload, FiChevronDown, FiChevronUp, FiCopy, FiCheck } from 'react-icons/fi';
import { ClipLoader } from 'react-spinners';
import RenderMdx from '../../Blog/RenderMdx';
import { getFileIcon } from '@/components/Admin/FileIcons';
import Link from 'next/link';

interface InlineFileProps {
    src: string;
    filename: string;
}

const MAX_PREVIEW_SIZE = 100 * 1024; // 100KB in bytes

const InlineFileView: React.FC<InlineFileProps> = ({ src, filename }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [fileContent, setFileContent] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mdxSource, setMdxSource] = useState<any>(null);
    const [isCopied, setIsCopied] = useState(false);
    const [triedToFetch, setTriedToFetch] = useState(false);
    const [width, setWidth] = useState<number>(0);
    const [fileSize, setFileSize] = useState<number>(0);
    const file_url_name = src.split('/').pop();

    const isProgrammingFile = (filename: string): boolean => {
        const programmingExtensions = [
            '.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.cpp', '.c',
            '.html', '.css', '.scss', '.php', '.rb', '.go', '.rs', '.swift',
            '.kt', '.cs', '.sql', '.sh', '.bash', '.ps1', '.r', '.m',
            '.json', '.xml', '.yaml', '.yml', '.toml', '.md', '.mdx'
        ];
        return programmingExtensions.some(ext => filename.toLowerCase().endsWith(ext));
    };

    const fetchFileContent = async () => {
        setTriedToFetch(true);
        if (!isProgrammingFile(filename)) return;

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(src);
            if (!response.ok) {
                throw new Error('Failed to fetch file content');
            }

            const size = parseInt(response.headers.get('content-length') || '0');
            setFileSize(size);

            if (size > MAX_PREVIEW_SIZE) {
                setError(`File is too large to preview (${(size / 1024).toFixed(1)}KB). Please download to view.`);
                setIsLoading(false);
                return;
            }

            const content = await response.text();
            setFileContent(content);

            if (isProgrammingFile(filename)) {
                const lang = filename.split('.').pop();
                const isMarkdown = lang === 'md' || lang === 'mdx';
                let codeAsMdx = '';
                if (isMarkdown) {
                    // use 4 backticks for code blocks
                    codeAsMdx = `\`\`\`\`${lang}\n${content}\n\`\`\`\`\``;
                } else {
                    codeAsMdx = `\`\`\`${lang}\n${content}\n\`\`\``;
                }

                try {
                    const response = await fetch('/api/serializeContent', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ content: codeAsMdx }),
                    });

                    if (response.ok) {
                        const data = await response.json();
                        setMdxSource(data.mdxSource);
                        setError(null);
                    } else {
                        const errorData = await response.json();
                        setError(errorData.error);
                        setMdxSource(null);
                    }
                } catch (err) {
                    setError(err instanceof Error ? err.message : 'Failed to process code');
                }
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopyContent = async () => {
        if (fileContent) {
            await navigator.clipboard.writeText(fileContent);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } else if (!error && !isLoading && !triedToFetch) {
            setTriedToFetch(true);
            fetchFileContent();
            setTimeout(() => {
                if (fileContent) {
                    navigator.clipboard.writeText(fileContent);
                    setIsCopied(true);
                    setTimeout(() => setIsCopied(false), 2000);
                }
            }, 1000);
        }
    };

    useEffect(() => {
        if (isExpanded && !fileContent && !error) {
            fetchFileContent();
        }
    }, [isExpanded]);

    // Add resize handler
    useEffect(() => {
        const handleResize = () => {
            const container = document.querySelector('.inline-file-container');
            if (container) {
                setWidth(container.clientWidth - 32); // 32px for padding
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isExpanded]);

    const renderContent = () => {
        if (!isExpanded) return null;

        if (isLoading) {
            return (
                <div className="flex justify-center p-4">
                    <ClipLoader size={24} />
                </div>
            );
        }

        if (error) {
            return (
                <div className="p-4 flex flex-col items-center gap-4 text-center">
                    <p className="text-red-500">{error}</p>
                    {fileSize > MAX_PREVIEW_SIZE && (
                        <Link href={`/api/files/download?file_url_name=${file_url_name}`}
                            download
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors inline-flex items-center gap-2"
                        >
                            <FiDownload /> Download File
                        </Link>
                    )}
                </div>
            );
        }

        return (
            <div className="relative">
                <div className="p-4 max-h-[80vh] overflow-y-auto overflow-x-auto">
                    {mdxSource ? (
                        <div className="min-w-full">
                            <RenderMdx mdxSource={mdxSource} />
                        </div>
                    ) : (
                        <pre className="whitespace-pre-wrap break-words overflow-x-auto">
                            <code className="text-sm md:text-base">{fileContent}</code>
                        </pre>
                    )}
                </div>
                <div className="absolute bottom-4 right-4 flex gap-2">
                    <button
                        onClick={handleCopyContent}
                        className="p-2 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors"
                        title="Copy code"
                    >
                        {isCopied ? <FiCheck /> : <FiCopy />}
                    </button>
                </div>
            </div>
        );
    };

    if (!src) {
        return null;
    }

    if (!filename) {
        filename = src.split('/').pop() || 'file';
    }

    // Inline view
    if (!isExpanded) {
        return (
            <span className="inline-flex align-middle">
                <span className="inline-flex border rounded-lg overflow-hidden shadow-md">
                    <span
                        className="bg-slate-100 dark:bg-dark p-2 flex items-center justify-between cursor-pointer"
                        onClick={() => isProgrammingFile(filename) && setIsExpanded(true)}
                    >
                        <span className="flex items-center gap-2 flex-1 min-w-0">
                            {getFileIcon(filename)}
                            <span className="font-medium truncate" title={filename}>{filename}</span>
                            {isProgrammingFile(filename) && (
                                <button
                                    className="text-blue-500 hover:text-blue-600 flex-shrink-0"
                                    aria-label="Expand"
                                >
                                    <FiChevronDown />
                                </button>
                            )}
                        </span>
                        <span className="flex items-center gap-2 ml-2">
                            {isProgrammingFile(filename) && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleCopyContent();
                                    }}
                                    className="p-2 text-blue-500 hover:text-blue-600"
                                    title="Copy code"
                                >
                                    {isCopied ? <FiCheck /> : <FiCopy />}
                                </button>
                            )}
                            <Link href={`/api/files/download?file_url_name=${file_url_name}`}
                                download
                                className="p-2 text-blue-500 hover:text-blue-600"
                                onClick={(e) => e.stopPropagation()}
                                title="Download file"
                            >
                                <FiDownload />
                            </Link>
                        </span>
                    </span>
                </span>
            </span>
        );
    }

    // Expanded view
    return (
        <div className="my-4 border rounded-lg overflow-hidden shadow-md">
            <div
                className="bg-slate-100 dark:bg-dark p-4 flex items-center justify-between cursor-pointer"
                onClick={() => isProgrammingFile(filename) && setIsExpanded(false)}
            >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    {getFileIcon(filename)}
                    <span className="font-medium truncate" title={filename}>{filename}</span>
                    {isProgrammingFile(filename) && (
                        <button
                            className="text-blue-500 hover:text-blue-600 flex-shrink-0"
                            aria-label="Collapse"
                        >
                            <FiChevronUp />
                        </button>
                    )}
                </div>
                <div className="flex items-center gap-2 ml-2">
                    <Link href={`/api/files/download?file_url_name=${file_url_name}`}
                        download
                        className="p-2 text-blue-500 hover:text-blue-600"
                        onClick={(e) => e.stopPropagation()}
                        title="Download file"
                    >
                        <FiDownload />
                    </Link>
                </div>
            </div>

            {renderContent()}
        </div>
    );
};

export default InlineFileView;