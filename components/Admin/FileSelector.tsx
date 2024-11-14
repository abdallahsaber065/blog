// components/FileSelector.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ClipLoader } from 'react-spinners';
import { toast } from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import { FiUpload, FiDownload, FiCode } from 'react-icons/fi';

interface FileProps {
    id: string;
    file_name: string;
    file_type: string;
    file_size: number;
    file_url: string;
}

interface FileSelectorProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (file: FileProps) => void;
    currentFile?: string;
    allowedTypes?: string[]; // e.g. ['.pdf', '.js', '.ts', '.py']
    folder?: string;
}

const FileSelector: React.FC<FileSelectorProps> = ({
    isOpen,
    onClose,
    onSelect,
    currentFile,
    allowedTypes = ['.pdf', '.js', '.ts', '.py', '.jsx', '.tsx', '.html', '.css'],
    folder = 'files'
}) => {
    const [files, setFiles] = useState<FileProps[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<FileProps | null>(null);
    const { data: session } = useSession();
    const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_REMOTE_URL;

    useEffect(() => {
        fetchFiles();
    }, []);

    const fetchFiles = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/files?folder=${folder}`);
            const filesWithFullUrls = await Promise.all(response.data.map(async (file: any) => {
                const fileUrl = `${NEXT_PUBLIC_BASE_URL}/${file.file_url}`;
                const exists = await checkFileExists(fileUrl);
                return exists ? { ...file, file_url: fileUrl } : null;
            }));
            setFiles(filesWithFullUrls.filter(Boolean));
        } catch (error) {
            toast.error('Failed to fetch files');
        }
        setLoading(false);
    };

    const checkFileExists = async (url: string) => {
        try {
            const response = await fetch(url, { method: 'HEAD' });
            return response.ok;
        } catch {
            return false;
        }
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Check file extension
        const fileExt = `.${file.name.split('.').pop()?.toLowerCase()}`;
        if (!allowedTypes.includes(fileExt)) {
            toast.error(`Only ${allowedTypes.join(', ')} files are allowed`);
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('userId', session?.user?.id as string);
        formData.append('saveDir', folder);

        setUploadLoading(true);
        try {
            const response = await axios.post('/api/files/upload', formData);
            const fileWithFullUrl = {
                ...response.data.file,
                file_url: `${NEXT_PUBLIC_BASE_URL}/${response.data.file.file_url}`
            };
            setFiles([...files, fileWithFullUrl]);
            setSelectedFile(fileWithFullUrl);
            toast.success('File uploaded successfully');
        } catch (error) {
            toast.error('Failed to upload file');
        }
        setUploadLoading(false);
    };

    const isProgrammingFile = (fileName: string) => {
        const ext = `.${fileName.split('.').pop()?.toLowerCase()}`;
        return ['.js', '.ts', '.py', '.jsx', '.tsx', '.html', '.css'].includes(ext);
    };

    const handleSelect = (file: FileProps) => {
        onSelect(file);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-dark w-full max-w-4xl rounded-lg overflow-hidden">
                <div className="p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">Select File</h2>
                        <button onClick={onClose} className="text-slate-500">&times;</button>
                    </div>

                    <div className="mb-4">
                        <input
                            type="file"
                            accept={allowedTypes.join(',')}
                            onChange={handleFileUpload}
                            className="hidden"
                            id="file-upload"
                        />
                        <label
                            htmlFor="file-upload"
                            className="bg-blue-500 text-white px-4 py-2 rounded cursor-pointer inline-flex items-center gap-2"
                        >
                            <FiUpload />
                            Upload File
                        </label>
                    </div>

                    {loading ? (
                        <div className="flex justify-center p-4">
                            <ClipLoader size={24} />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-2 max-h-[60vh] overflow-y-auto">
                            {files.map((file) => (
                                <div
                                    key={file.id}
                                    onClick={() => setSelectedFile(file)}
                                    className={`p-3 border rounded cursor-pointer flex items-center justify-between ${selectedFile?.id === file.id ? 'border-blue-500 bg-blue-50' : ''
                                        }`}
                                >
                                    <div className="flex items-center gap-2">
                                        {isProgrammingFile(file.file_name) ? (
                                            <FiCode className="text-xl" />
                                        ) : (
                                            <FiDownload className="text-xl" />
                                        )}
                                        <span>{file.file_name}</span>
                                    </div>
                                    <span className="text-sm text-slate-500">
                                        {(file.file_size / 1024).toFixed(2)} KB
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex justify-end gap-2 mt-4">
                        <button
                            onClick={() => selectedFile && handleSelect(selectedFile)}
                            disabled={!selectedFile}
                            className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50"
                        >
                            Select
                        </button>
                        <button
                            onClick={onClose}
                            className="bg-slate-500 text-white px-4 py-2 rounded"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FileSelector;