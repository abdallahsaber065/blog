import React from 'react';
import { FiDownload, FiCode } from 'react-icons/fi';

interface RenderFileProps {
    fileName: string;
    fileUrl: string;
    fileContent?: string;
}

const RenderFile: React.FC<RenderFileProps> = ({ fileName, fileUrl, fileContent }) => {
    const isPdf = fileName.toLowerCase().endsWith('.pdf');
    
    if (isPdf) {
        return (
            <a 
                href={fileUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-500 hover:text-blue-600"
            >
                <FiDownload />
                Download {fileName}
            </a>
        );
    }

    return (
        <div className="relative">
            <div className="flex items-center gap-2 mb-2">
                <FiCode />
                <span>{fileName}</span>
            </div>
            <pre className="p-4 bg-gray-100 dark:bg-gray-800 rounded overflow-x-auto">
                <code>{fileContent}</code>
            </pre>
        </div>
    );
};

export default RenderFile;
