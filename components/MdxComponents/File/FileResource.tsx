import React from 'react';
import { FiDownload } from 'react-icons/fi';
import { getFileIcon } from '@/components/Admin/FileIcons';
import Link from 'next/link';
import { resolvePublicUrl } from '@/lib/storage';

interface FileResourceProps {
    src: string;
    filename: string;
}

const FileResource: React.FC<FileResourceProps> = ({ src, filename }) => {
    if (!src) {
        return null;
    }

    const provider = process.env.NEXT_PUBLIC_STORAGE_PROVIDER || 'local';

    if (!filename) {
        filename = src.split('/').pop() || 'file';
    }
    const file_url_name = src.split('/').pop();

    // Use direct link for non-local providers, otherwise use the download proxy
    const downloadUrl = (provider === 'imagekit' || provider === 's3')
        ? resolvePublicUrl(src)
        : `/api/files/download?file_url_name=${file_url_name}`;

    return (
        <div className="my-2 border rounded-lg overflow-hidden shadow-md inline-block">
            <div className="bg-slate-100 dark:bg-dark p-4 flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    {getFileIcon(filename)}
                    <span className="font-medium truncate" title={filename}>{filename}</span>
                </div>
                <div className="flex items-center gap-2 ml-2">
                    <Link href={downloadUrl}
                        download
                        className="p-2 text-gold hover:text-goldDark"
                        title="Download file"
                        target={provider !== 'local' ? "_blank" : undefined}
                        rel={provider !== 'local' ? "noopener noreferrer" : undefined}
                    >
                        <FiDownload />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default FileResource;