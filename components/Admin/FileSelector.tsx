// components/FileSelector.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ClipLoader } from 'react-spinners';
import { toast } from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import { FiUpload, FiDownload, FiCode, FiTrash2, FiFileText } from 'react-icons/fi';
import { FILE_ICONS, getFileIcon } from '@/components/Admin/FileIcons';

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

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    fileName: string;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ isOpen, onClose, onConfirm, fileName }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[60]">
            <div className="bg-white dark:bg-dark rounded-lg p-6 max-w-sm w-full mx-4">
                <h3 className="text-lg font-semibold mb-4">Delete File</h3>
                <p className="mb-6">
                    Are you sure you want to delete <span className="font-semibold break-all">{fileName}</span>? 
                    This action cannot be undone.
                </p>
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm rounded bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 text-sm rounded bg-red-500 text-white hover:bg-red-600"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

const FileSelector: React.FC<FileSelectorProps> = ({
    isOpen,
    onClose,
    onSelect,
    currentFile,
    allowedTypes = Object.keys(FILE_ICONS).map(ext => `.${ext}`),
    folder = 'files'
}) => {
    const [files, setFiles] = useState<FileProps[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<FileProps | null>(null);
    const { data: session } = useSession();
    const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_REMOTE_URL;
    const [confirmDialog, setConfirmDialog] = useState<{
        isOpen: boolean;
        file: FileProps | null;
    }>({
        isOpen: false,
        file: null
    });
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchFiles();
    }, []);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

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

    const handleDeleteFile = async (file: FileProps, e: React.MouseEvent) => {
        e.stopPropagation();
        setConfirmDialog({ isOpen: true, file });
    };

    const handleConfirmDelete = async () => {
        if (!confirmDialog.file) return;
        
        try {
            await axios.delete(`/api/files?id=${confirmDialog.file.id}`);
            setFiles(files.filter(f => f.id !== confirmDialog.file!.id));
            
            if (selectedFile?.id === confirmDialog.file.id) {
                setSelectedFile(null);
            }
            
            toast.success('File deleted successfully');
        } catch (error) {
            toast.error('Failed to delete file');
        } finally {
            setConfirmDialog({ isOpen: false, file: null });
        }
    };

    const filteredFiles = files.filter(file => 
        file.file_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
                <div className="bg-white dark:bg-dark w-full max-w-4xl rounded-xl shadow-2xl flex flex-col h-[85vh]">
                    <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Select File</h2>
                            <button onClick={onClose} className="text-slate-500 hover:text-slate-700">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div className="p-6 pb-0 flex justify-between items-center gap-4">
                        <div className="flex-shrink-0">
                            <input type="file" accept={allowedTypes.join(',')} onChange={handleFileUpload} className="hidden" id="file-upload" />
                            <label htmlFor="file-upload" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg cursor-pointer inline-flex items-center gap-2">
                                <FiUpload className="text-lg" />
                                Upload File
                            </label>
                        </div>
                        <div className="flex-1 max-w-md">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search files..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white"
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-hidden p-6">
                        {loading ? (
                            <div className="flex justify-center p-8">
                                <ClipLoader color="#3B82F6" size={32} />
                            </div>
                        ) : (
                            <div className="h-full overflow-y-auto pr-2 custom-scrollbar">
                                <div className="grid grid-cols-1 gap-3">
                                    {filteredFiles.map((file) => (
                                        <div
                                            key={file.id}
                                            onClick={() => setSelectedFile(file)}
                                            className={`p-4 border rounded-lg cursor-pointer flex items-start transition-all hover:shadow-md
                                                ${selectedFile?.id === file.id 
                                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30' 
                                                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                                                }`}
                                        >
                                            <div className="flex flex-1 gap-2 min-w-0">
                                                <div className="flex-shrink-0 mt-1">
                                                    {getFileIcon(file.file_name)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm font-medium break-all">
                                                        {file.file_name}
                                                    </div>
                                                    <span className="text-xs text-slate-500 block mt-0.5">
                                                        {(file.file_size / 1024).toFixed(2)} KB
                                                    </span>
                                                </div>
                                                <div className="flex-shrink-0 ml-2">
                                                    <button
                                                        onClick={(e) => handleDeleteFile(file, e)}
                                                        className="p-1.5 text-red-500 hover:text-red-600 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                                                        title="Delete file"
                                                    >
                                                        <FiTrash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-6 border-t border-slate-200 dark:border-slate-700 mt-auto">
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={onClose}
                                className="px-6 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => selectedFile && handleSelect(selectedFile)}
                                disabled={!selectedFile}
                                className="px-6 py-2.5 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Select
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                onClose={() => setConfirmDialog({ isOpen: false, file: null })}
                onConfirm={handleConfirmDelete}
                fileName={confirmDialog.file?.file_name || ''}
            />
        </>
    );
};

export default FileSelector;