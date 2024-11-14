import React, { useState, useEffect } from 'react';
import { FiDownload, FiChevronDown, FiChevronUp, FiCopy, FiCheck } from 'react-icons/fi';
import { ClipLoader } from 'react-spinners';
import RenderMdx from '../../Blog/RenderMdx';
import FileSelector from '../../Admin/FileSelector';

interface FileProps {
    id: string;
    file_name: string;
    file_type: string;
    file_size: number;
    file_url: string;
}

interface InlineFileUploadProps {
    src: string;
    filename: string;
    onFileChange: (file: FileProps) => void;
}

const InlineFileUpload: React.FC<InlineFileUploadProps> = ({ src, filename, onFileChange }) => {
    const [showSelector, setShowSelector] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [fileContent, setFileContent] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mdxSource, setMdxSource] = useState<any>(null);
    const [isCopied, setIsCopied] = useState(false);
    const [triedToFetch, setTriedToFetch] = useState(false);

    const isProgrammingFile = (filename: string): boolean => {
        const programmingExtensions = [
            '.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.cpp', '.c',
            '.html', '.css', '.scss', '.php', '.rb', '.go', '.rs', '.swift',
            '.kt', '.cs', '.sql', '.sh', '.bash', '.ps1', '.r', '.m',
            '.json', '.xml', '.yaml', '.yml', '.toml', '.md', '.mdx'
        ];
        return programmingExtensions.some(ext => filename.toLowerCase().endsWith(ext));
    };

    const fetchFileContent = async (url: string) => {
        setTriedToFetch(true);
        if (!isProgrammingFile(filename)) return;

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Failed to fetch file content');
            }

            const content = await response.text();
            setFileContent(content);

            if (isProgrammingFile(filename)) {
                const lang = filename.split('.').pop();
                const codeAsMdx = `\`\`\`${lang}\n${content}\n\`\`\``;

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
            fetchFileContent(src);
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
            fetchFileContent(src);
        }
    }, [isExpanded]);

    const handleFileSelect = (file: FileProps) => {
        onFileChange(file);
        setShowSelector(false);
        setFileContent(null); // Clear content when file changes
    };

    if (!src) {
        return null;
    }

    if (!filename) {
        filename = src.split('/').pop() || 'file';
    }

    return (
        <span className="inline-block my-2 border rounded-lg overflow-hidden shadow-md align-middle max-w-full">
            <span
                className="bg-slate-100 dark:bg-dark p-2 flex items-center justify-between cursor-pointer"
                onClick={() => isProgrammingFile(filename) && setIsExpanded(!isExpanded)}
            >
                <span className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="font-medium truncate">{filename}</span>
                    {isProgrammingFile(filename) && (
                        <button 
                            className="text-blue-500 hover:text-blue-600 flex-shrink-0"
                            aria-label={isExpanded ? "Collapse" : "Expand"}
                        >
                            {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                        </button>
                    )}
                </span>
                <span className="flex items-center gap-2 ml-2">
                    {isProgrammingFile(filename) && !isExpanded && (
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
                    <a
                        href={src}
                        download
                        className="p-2 text-blue-500 hover:text-blue-600"
                        onClick={(e) => e.stopPropagation()}
                        title="Download file"
                    >
                        <FiDownload />
                    </a>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowSelector(true);
                        }}
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Change File
                    </button>
                </span>
            </span>

            {isExpanded && (
                <span className="block p-4 max-h-[80vh] overflow-y-auto overflow-x-auto max-w-full">
                    {isLoading ? (
                        <div className="flex justify-center p-4">
                            <ClipLoader size={24} />
                        </div>
                    ) : error ? (
                        <div className="p-4 text-red-500">
                            {error}
                        </div>
                    ) : (
                        <div className="relative">
                            {mdxSource ? (
                                <div className="min-w-full">
                                    <RenderMdx mdxSource={mdxSource} />
                                </div>
                            ) : (
                                <pre className="whitespace-pre-wrap break-words overflow-x-auto">
                                    <code className="text-sm md:text-base">{fileContent}</code>
                                </pre>
                            )}
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
                    )}
                </span>
            )}

            {showSelector && (
                <FileSelector
                    isOpen={showSelector}
                    onClose={() => setShowSelector(false)}
                    onSelect={handleFileSelect}
                    currentFile={src}
                />
            )}
        </span>
    );
};

export default InlineFileUpload;