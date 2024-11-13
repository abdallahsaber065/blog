// components/FileDisplay/CustomFileDisplay.tsx
import React, { useState, useEffect } from 'react';
import FileSelector from '../../Admin/FileSelector';
import { FiDownload, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { ClipLoader } from 'react-spinners';
import RenderMdx from '../../Blog/RenderMdx';

// Add cache object outside component for persistence
const fileContentCache: { [key: string]: string } = {};

interface FileProps {
    id: string;
    file_name: string;
    file_type: string;
    file_size: number;
    file_url: string;
}

interface CustomFileDisplayProps {
    src: string;
    id: string;
    onFileChange: (file: FileProps) => void;
    filename: string;
}

const CustomFileDisplay: React.FC<CustomFileDisplayProps> = ({ src, onFileChange, filename, id }) => {
    const [showSelector, setShowSelector] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [fileContent, setFileContent] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mdxSource, setMdxSource] = useState<any>(null);


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

            const content = await response.text();
            setFileContent(content);

            // make it mdx and add lang to code blocks
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
        const ext = `.${fileName.split('.').pop()?.toLowerCase()}`;
        return ['.js', '.ts', '.py', '.jsx', '.tsx', '.html', '.css'].includes(ext);
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

        return (
            <div className="p-4">
                {mdxSource && <RenderMdx mdxSource={mdxSource} />}
            </div>
        );
    };

    return (
        <div className="my-4 border rounded-lg overflow-hidden">
            <div
                className="bg-gray-100 dark:bg-gray-800 p-4 flex items-center justify-between cursor-pointer"
                onClick={() => isProgrammingFile(filename) && setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-2">
                    <span className="font-medium">{filename}</span>
                    {isProgrammingFile(filename) ? (
                        <button className="text-blue-500 hover:text-blue-600">
                            {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                        </button>
                    ) : (
                        <a
                            href={src}
                            download
                            className="text-blue-500 hover:text-blue-600"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <FiDownload />
                        </a>
                    )}
                </div>
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

            {isProgrammingFile(filename) && renderContent()}

            {showSelector && (
                <FileSelector
                    isOpen={showSelector}
                    onClose={() => setShowSelector(false)}
                    onSelect={handleFileSelect}
                    currentFile={src}
                />
            )}
        </div>
    );
};

export default CustomFileDisplay;