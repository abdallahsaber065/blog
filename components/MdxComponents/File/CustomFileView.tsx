import React, { useState, useEffect } from 'react';
import { FiDownload, FiChevronDown, FiChevronUp, FiCopy, FiCheck } from 'react-icons/fi';
import { ClipLoader } from 'react-spinners';
import RenderMdx from '../../Blog/RenderMdx';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// Add cache object outside component for persistence
const fileContentCache: { [key: string]: string } = {};

interface CustomFileViewProps {
    src: string;
    filename: string;
}

const CustomFileView: React.FC<CustomFileViewProps> = ({ src, filename }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [fileContent, setFileContent] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mdxSource, setMdxSource] = useState<any>(null);
    const [numPages, setNumPages] = useState<number | null>(null);
    const [isCopied, setIsCopied] = useState(false);

    const isProgrammingFile = (filename: string): boolean => {
        const programmingExtensions = [
            '.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.cpp', '.c',
            '.html', '.css', '.scss', '.php', '.rb', '.go', '.rs', '.swift',
            '.kt', '.cs', '.sql', '.sh', '.bash', '.ps1', '.r', '.m',
            '.json', '.xml', '.yaml', '.yml', '.toml', '.md', '.mdx'
        ];
        return programmingExtensions.some(ext => filename.toLowerCase().endsWith(ext));
    };

    const isPdfFile = (filename: string): boolean => {
        return filename.toLowerCase().endsWith('.pdf');
    };

    const fetchFileContent = async () => {
        if (!isProgrammingFile(filename) && !isPdfFile(filename)) return;
        
        // Check cache first
        if (fileContentCache[src]) {
            setFileContent(fileContentCache[src]);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(src);
            if (!response.ok) {
                throw new Error('Failed to fetch file content');
            }

            const content = await response.text();
            fileContentCache[src] = content; // Cache the content
            setFileContent(content);

            // If it's a markdown file, prepare it for rendering
            if (filename.toLowerCase().endsWith('.md') || filename.toLowerCase().endsWith('.mdx')) {
                // You'll need to implement your MDX processing logic here
                // This is just a placeholder
                setMdxSource(content);
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
        }
    };

    useEffect(() => {
        if (isExpanded && !fileContent && !error) {
            fetchFileContent();
        }
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
                <div className="p-4 text-red-500">
                    {error}
                </div>
            );
        }

        if (isPdfFile(filename)) {
            return (
                <div className="p-4 max-h-[500px] overflow-y-auto">
                    <Document
                        file={src}
                        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                        error="Failed to load PDF"
                    >
                        {Array.from(new Array(numPages), (el, index) => (
                            <Page 
                                key={`page_${index + 1}`}
                                pageNumber={index + 1}
                                className="mb-4"
                            />
                        ))}
                    </Document>
                </div>
            );
        }

        if (isProgrammingFile(filename)) {
            return (
                <div className="p-4 max-h-[500px] overflow-y-auto">
                    <pre className="whitespace-pre-wrap break-words">
                        <code>{fileContent}</code>
                    </pre>
                </div>
            );
        }

        return (
            <div className="p-4 max-h-[500px] overflow-y-auto">
                {mdxSource && <RenderMdx mdxSource={mdxSource} />}
            </div>
        );
    };

    return (
        <div className="my-4 border rounded-lg overflow-hidden">
            <div
                className="bg-gray-100 dark:bg-gray-800 p-4 flex items-center justify-between cursor-pointer"
                onClick={() => (isProgrammingFile(filename) || isPdfFile(filename)) && setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-2">
                    <span className="font-medium">{filename}</span>
                    {(isProgrammingFile(filename) || isPdfFile(filename)) && (
                        <button className="text-blue-500 hover:text-blue-600">
                            {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                        </button>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {isProgrammingFile(filename) && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleCopyContent();
                            }}
                            className="text-blue-500 hover:text-blue-600 p-2"
                            title="Copy code"
                        >
                            {isCopied ? <FiCheck /> : <FiCopy />}
                        </button>
                    )}
                    <a
                        href={src}
                        download
                        className="text-blue-500 hover:text-blue-600 p-2"
                        onClick={(e) => e.stopPropagation()}
                        title="Download file"
                    >
                        <FiDownload />
                    </a>
                </div>
            </div>

            {renderContent()}
        </div>
    );
};

export default CustomFileView;
