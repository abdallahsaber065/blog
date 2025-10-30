/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
import React, { useState } from 'react';
import { ClipLoader } from 'react-spinners';
import ContentSettings from './ContentSettings';
import JSONEditorComponent from '../JSONEditor';
import LogViewer from './LogViewer';
import FileSelector from '@/components/Admin/FileSelector';
import ImageSelector from '@/components/Admin/ImageSelector';
import { FaFile, FaImage } from 'react-icons/fa';
// expand icon
import { AiOutlineExpand } from 'react-icons/ai';
import { Button } from '@/components/ui/button';

interface AIContentGeneratorProps {
    className?: string;
    topic: string;
    setTopic: (value: string) => void;
    numOfTerms: number;
    setNumOfTerms: (value: number) => void;
    numOfKeywords: number;
    setNumOfKeywords: (value: number) => void;
    numOfPoints: number;
    setNumOfPoints: (value: number) => void;
    enableNumOfPoints: boolean;
    setEnableNumOfPoints: (value: boolean) => void;
    userCustomInstructions: string;
    setUserCustomInstructions: (value: string) => void;
    showContentSettings: boolean;
    setShowContentSettings: (value: boolean) => void;
    loading: boolean;
    outline: any;
    outlineDraft: any;
    setOutlineDraft: (value: any) => void;
    showJSONEditor: boolean;
    setShowJSONEditor: (value: boolean) => void;
    showLogViewer: boolean;
    setShowLogViewer: (value: boolean) => void;
    includeSearchTerms: boolean;
    setIncludeSearchTerms: (value: boolean) => void;
    handleGenerateOutline: () => void;
    handleAcceptOutline: () => void;
    handleSaveOutline: () => void;
    includeImages: boolean;
    setIncludeImages: (value: boolean) => void;
    onFileSelect: (files: string[]) => void;
    onImageSelect: (images: string[]) => void;
}

interface FileProps {
    id: string;
    file_name: string;
    file_type: string;
    file_size: number;
    file_url: string;
}

interface ImageProps {
    id: string;
    file_name: string;
    file_type: string;
    file_size: number;
    file_url: string;
    width: number;
    height: number;
}


const AIContentGenerator: React.FC<AIContentGeneratorProps> = ({
    className,
    topic,
    setTopic,
    numOfTerms,
    setNumOfTerms,
    numOfKeywords,
    setNumOfKeywords,
    numOfPoints,
    setNumOfPoints,
    enableNumOfPoints,
    setEnableNumOfPoints,
    userCustomInstructions,
    setUserCustomInstructions,
    showContentSettings,
    setShowContentSettings,
    loading,
    outline,
    outlineDraft,
    setOutlineDraft,
    showJSONEditor,
    setShowJSONEditor,
    showLogViewer,
    setShowLogViewer,
    includeSearchTerms,
    setIncludeSearchTerms,
    handleGenerateOutline,
    handleAcceptOutline,
    handleSaveOutline,
    includeImages,
    setIncludeImages,
    onFileSelect,
    onImageSelect

}) => {
    const [selectedFiles, setSelectedFiles] = useState<{ url: string; name: string }[]>([]);
    const [selectedImages, setSelectedImages] = useState<string[]>([]);
    const [showFileSelector, setShowFileSelector] = useState(false);
    const [showImageSelector, setShowImageSelector] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const handleFileSelect = (file: FileProps) => {
        const fileUrl = `${process.env.NEXT_PUBLIC_REMOTE_URL}/api/files/download?file_url_name=${file.file_url.split('/').pop()}`;
        const fileName = file.file_name;

        if (!selectedFiles.some(selectedFile => selectedFile.url === fileUrl)) {
            const newFile = { url: fileUrl, name: fileName };
            setSelectedFiles((prev) => [...prev, newFile]);
            onFileSelect([...selectedFiles.map(f => f.url), fileUrl]);
        }
    };

    const handleImageSelect = (image: ImageProps) => {
        if (!selectedImages.includes(image.file_url)) {
            setSelectedImages((prev) => [...prev, image.file_url]);
            onImageSelect([...selectedImages, image.file_url]);
        }
    };

    const removeFile = (fileUrl: string) => {
        const updatedFiles = selectedFiles.filter((file) => file.url !== fileUrl);
        setSelectedFiles(updatedFiles);
        console.log(updatedFiles);
        onFileSelect(updatedFiles.map(file => file.url));
        console.log(updatedFiles.map(file => file.url));
    };

    const removeImage = (imageUrl: string) => {
        setSelectedImages((prev) => prev.filter((url) => url !== imageUrl));
        onImageSelect(selectedImages.filter((url) => url !== imageUrl));
    };

    const handleShowPreview = (imageUrl: string) => {
        setPreviewImage(imageUrl);
    };

    return (
        <div className={`mb-8 border border-slate-200 dark:border-slate-700 rounded-lg p-4 ${className}`}>
            <div className="flex flex-col">
                <div className="flex items-center">
                    <input
                        className="topic-input w-full text-gray dark:text-lightgray bg-white dark:bg-dark p-2 border border-slate-300 rounded"
                        type="text"
                        placeholder="Enter your post topic here"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                    />
                    <button
                        className="ml-2 text-blue-500 hover:text-blue-600"
                        onClick={() => setShowFileSelector(true)}
                    >
                        <FaFile />
                    </button>
                    <button
                        className="ml-2 text-green-500 hover:text-green-600"
                        onClick={() => setShowImageSelector(true)}
                    >
                        <FaImage />
                    </button>
                </div>

                <div className="flex flex-wrap gap-2 mb-2 mt-1">
                    {selectedFiles.map((file, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded flex items-center truncate max-w-xs">
                            {file.name}
                            <button
                                className="ml-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                                onClick={() => removeFile(file.url)}
                                title="Remove file"
                            >
                                &times;
                            </button>
                        </span>
                    ))}
                    {selectedImages.map((imageUrl, index) => (
                        <div key={index} className="relative group">
                            <span className="absolute top-0 right-0">
                                <button
                                    className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                                    onClick={() => removeImage(imageUrl)}
                                    title="Remove image"
                                >
                                    &times;
                                </button>
                            </span>
                            <img src={imageUrl} className="w-16 h-16 object-cover rounded" />
                            <button
                                className="absolute bottom-0 left-0 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => handleShowPreview(imageUrl)}
                                title="Show Preview"
                            >
                                <AiOutlineExpand />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <ContentSettings
                topic={topic}
                setTopic={setTopic}
                numOfTerms={numOfTerms}
                setNumOfTerms={setNumOfTerms}
                numOfKeywords={numOfKeywords}
                setNumOfKeywords={setNumOfKeywords}
                numOfPoints={numOfPoints}
                setNumOfPoints={setNumOfPoints}
                enableNumOfPoints={enableNumOfPoints}
                setEnableNumOfPoints={setEnableNumOfPoints}
                userCustomInstructions={userCustomInstructions}
                setUserCustomInstructions={setUserCustomInstructions}
                showContentSettings={showContentSettings}
                setShowContentSettings={setShowContentSettings}
                includeSearchTerms={includeSearchTerms}
                setIncludeSearchTerms={setIncludeSearchTerms}
                includeImages={includeImages}
                setIncludeImages={setIncludeImages}
            />

            <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <Button
                    className="generate-outline-btn"
                    onClick={handleGenerateOutline}
                    disabled={loading}
                >
                    {loading ? <ClipLoader size={20} color={"#fff"} /> : 'Generate Outline'}
                </Button>

                <Button
                    className="edit-outline-btn"
                    variant="warning"
                    onClick={() => setShowJSONEditor(true)}
                >
                    Edit Outline
                </Button>

                {outline && (
                    <Button
                        className="generate-content-btn"
                        variant="success"
                        onClick={handleAcceptOutline}
                        disabled={loading}
                    >
                        {loading ? <ClipLoader size={20} color={"#fff"} /> : 'Generate Content'}
                    </Button>
                )}

                <Button
                    variant="secondary"
                    onClick={() => setShowLogViewer(true)}
                >
                    View Logs
                </Button>
            </div>

            {showJSONEditor && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-lg w-3/4">
                        <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-200">Edit Outline</h2>
                        <JSONEditorComponent value={outlineDraft || outline} onChange={setOutlineDraft} />
                        <div className="flex justify-end gap-4 mt-4">
                            <Button
                                variant="destructive"
                                onClick={() => setShowJSONEditor(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSaveOutline}
                            >
                                Save
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {showLogViewer && (
                <LogViewer
                    onClose={() => setShowLogViewer(false)}
                    link='https://generate.api.devtrend.tech/logs'
                />
            )}

            {showFileSelector && (
                <FileSelector
                    isOpen={showFileSelector}
                    onClose={() => setShowFileSelector(false)}
                    onSelect={handleFileSelect}
                />
            )}

            {showImageSelector && (
                <ImageSelector
                    isOpen={showImageSelector}
                    onClose={() => setShowImageSelector(false)}
                    onSelect={handleImageSelect}
                    folder='blog'
                />
            )}

            {previewImage && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-4 rounded shadow-lg w-3/4">
                        <h2 className="text-xl font-bold mb-4">Image Preview</h2>
                        <img src={previewImage} alt="Preview" className="w-full h-auto" />
                        <button
                            className="mt-4 bg-red-500 text-white p-2 rounded"
                            onClick={() => setPreviewImage(null)}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AIContentGenerator;
