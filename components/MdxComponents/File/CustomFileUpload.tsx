import React, { useState, useEffect } from 'react';
import FileSelector from '../../Admin/FileSelector';
import { FiDownload, FiChevronDown, FiChevronUp, FiCopy, FiCheck } from 'react-icons/fi';
import { ClipLoader } from 'react-spinners';
import RenderMdx from '../../Blog/RenderMdx';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import { getFileIcon } from '@/components/Admin/FileIcons';
// Set worker directly
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/legacy/build/pdf.worker.min.mjs`;

// Add cache object outside component for persistence
const fileContentCache: { [key: string]: string } = {};

// Add this constant at the top with other constants
const MAX_FILE_SIZE_FOR_PREVIEW = 100 * 1024; // 100KB in bytes

interface FileProps {
    id: string;
    file_name: string;
    file_type: string;
    file_size: number;
    file_url: string;
}

interface CustomFileUploadProps {
    src: string;
    id: string;
    onFileChange: (file: FileProps) => void;
    filename: string;
}

const CustomFileUpload: React.FC<CustomFileUploadProps> = ({ src, onFileChange, filename }) => {
    const [showSelector, setShowSelector] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [fileContent, setFileContent] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mdxSource, setMdxSource] = useState<any>(null);
    const [numPages, setNumPages] = useState<number | null>(null);
    const [isCopied, setIsCopied] = useState(false);
    const [triedToFetch, setTriedToFetch] = useState(false);

    if (!filename && !src) {
        filename = "No file selected";
        src = "";
    }
    if (!src) {
        src = "";
    }
    const file_url_name = src.split('/').pop();


    const fetchFileContent = async (url: string) => {
        // Check cache first
        if (fileContentCache[url]) {
            setFileContent(fileContentCache[url]);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Failed to load file content');
            }

            // Check content length from headers
            const contentLength = response.headers.get('content-length');
            if (contentLength && parseInt(contentLength) > MAX_FILE_SIZE_FOR_PREVIEW) {
                setError('File is too large to preview. Please download to view contents.');
                setIsLoading(false);
                return;
            }

            const content = await response.text();
            setFileContent(content);

            // make it mdx and add lang to code blocks
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
                fileContentCache[url] = content;
                setIsLoading(false);
            }
            // Cache the content
            fileContentCache[url] = content;
            setFileContent(content);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load file');
            setIsLoading(false);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isExpanded && isProgrammingFile(filename) && !fileContent) {
            fetchFileContent(src);
        }
    }, [isExpanded, filename, src]);

    const handleFileSelect = (file: FileProps) => {
        onFileChange(file);
        setShowSelector(false);
        setFileContent(null); // Clear content when file changes
    };

    const isProgrammingFile = (fileName: string) => {
        const programmingExtensions = [
            '.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.cpp', '.c',
            '.html', '.css', '.scss', '.php', '.rb', '.go', '.rs', '.swift',
            '.kt', '.cs', '.sql', '.sh', '.bash', '.ps1', '.r', '.m',
            '.json', '.xml', '.yaml', '.yml', '.toml', '.md', '.mdx'
        ];
        return programmingExtensions.some(ext => filename.toLowerCase().endsWith(ext));
    };

    const isPdfFile = (fileName: string) => {
        return fileName.toLowerCase().endsWith('.pdf');
    };

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

        return (
            <div className="p-4 max-h-[500px] overflow-y-auto">
                {mdxSource && <RenderMdx mdxSource={mdxSource} />}
            </div>
        );
    };

    return (
        <div className="my-4 border rounded-lg overflow-hidden">
            <div
                className="bg-slate-100 dark:bg-dark p-4 flex items-center justify-between cursor-pointer"
                onClick={() => (isProgrammingFile(filename) || isPdfFile(filename)) && setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    {getFileIcon(filename)}
                    <span className="font-medium truncate" title={filename}>{filename}</span>
                    {(isProgrammingFile(filename) || isPdfFile(filename)) && (
                        <button className="text-blue-500 hover:text-blue-600 flex-shrink-0">
                            {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                        </button>
                    )}
                </div>
                <div className="flex items-center gap-2 ml-2">
                    <a
                        href={`/api/files/download?file_url_name=${file_url_name}`}
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
                </div>
            </div>

            {(isProgrammingFile(filename) || isPdfFile(filename)) && renderContent()}

            {showSelector && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white dark:bg-dark rounded-lg shadow-xl max-h-[90vh] w-[90vw] max-w-2xl overflow-hidden">
                        <FileSelector
                            isOpen={showSelector}
                            onClose={() => setShowSelector(false)}
                            onSelect={handleFileSelect}
                            currentFile={src}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomFileUpload;