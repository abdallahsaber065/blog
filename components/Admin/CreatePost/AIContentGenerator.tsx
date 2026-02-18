/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
import React, { useState } from 'react';
import ContentSettings from './ContentSettings';
import JSONEditorComponent from '../JSONEditor';
import FileSelector from '@/components/Admin/FileSelector';
import ImageSelector from '@/components/Admin/ImageSelector';
import { FaFile, FaImage } from 'react-icons/fa';
import { AiOutlineExpand } from 'react-icons/ai';
import { Button } from '@/components/ui/button';
import { Sparkles, Wand2, FileJson, CheckCheck, X } from 'lucide-react';

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
        <div className={`mb-8 rounded-2xl overflow-hidden border border-darkBorder bg-dark ${className}`}>
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-darkBorder bg-darkSurface">
                <div className="p-1.5 rounded-lg bg-gold/10 border border-gold/25">
                    <Sparkles className="w-4 h-4 text-gold" />
                </div>
                <span className="text-sm font-semibold text-foreground font-display tracking-wide">AI Content Generator</span>
                <span className="ml-auto text-[10px] uppercase tracking-widest font-bold text-gold/70 bg-gold/10 px-2 py-0.5 rounded-full">Beta</span>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <input
                            className="topic-input flex-1 bg-darkElevated border border-darkBorder rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-colors"
                            type="text"
                            placeholder="Enter your post topic here…"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                        />
                        <button
                            className="p-2.5 rounded-xl border border-darkBorder hover:border-gold/40 hover:bg-gold/5 text-muted-foreground hover:text-gold transition-colors"
                            onClick={() => setShowFileSelector(true)}
                            title="Attach file"
                        >
                            <FaFile className="w-4 h-4" />
                        </button>
                        <button
                            className="p-2.5 rounded-xl border border-darkBorder hover:border-gold/40 hover:bg-gold/5 text-muted-foreground hover:text-gold transition-colors"
                            onClick={() => setShowImageSelector(true)}
                            title="Attach image"
                        >
                            <FaImage className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Selected files & images */}
                    {(selectedFiles.length > 0 || selectedImages.length > 0) && (
                        <div className="flex flex-wrap gap-2">
                            {selectedFiles.map((file, i) => (
                                <span key={i} className="flex items-center gap-1.5 bg-gold/10 border border-gold/25 text-gold text-xs font-medium px-3 py-1 rounded-full max-w-[200px]">
                                    <FaFile className="w-3 h-3 flex-shrink-0" />
                                    <span className="truncate">{file.name}</span>
                                    <button onClick={() => removeFile(file.url)} className="flex-shrink-0 ml-1 hover:text-red-400 transition-colors">
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                            {selectedImages.map((imageUrl, i) => (
                                <div key={i} className="relative group">
                                    <button
                                        className="absolute -top-1.5 -right-1.5 z-10 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                                        onClick={() => removeImage(imageUrl)}
                                    >&times;</button>
                                    <img src={imageUrl} className="w-14 h-14 object-cover rounded-lg border border-darkBorder" />
                                    <button
                                        className="absolute bottom-0 left-0 right-0 flex items-center justify-center bg-dark/70 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity py-1"
                                        onClick={() => handleShowPreview(imageUrl)}
                                    >
                                        <AiOutlineExpand className="w-3.5 h-3.5 text-gold" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
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

                <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                        className="generate-outline-btn gap-2 flex-1"
                        onClick={handleGenerateOutline}
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="inline-block w-4 h-4 border-2 border-dark border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <><Wand2 className="w-4 h-4" /> Generate Outline</>
                        )}
                    </Button>

                    <Button
                        className="edit-outline-btn gap-2"
                        variant="warning"
                        onClick={() => setShowJSONEditor(true)}
                    >
                        <FileJson className="w-4 h-4" /> Edit Outline
                    </Button>

                    {outline && (
                        <Button
                            className="generate-content-btn gap-2"
                            variant="success"
                            onClick={handleAcceptOutline}
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="inline-block w-4 h-4 border-2 border-dark border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <><CheckCheck className="w-4 h-4" /> Generate Content</>
                            )}
                        </Button>
                    )}
                </div>
            </div>

            {/* JSON Editor Modal */}
            {showJSONEditor && (
                <div className="fixed inset-0 bg-dark/80 backdrop-blur-sm flex justify-center items-center z-50">
                    <div className="bg-darkSurface border border-darkBorder p-6 rounded-2xl shadow-2xl w-3/4 max-w-2xl">
                        <h2 className="text-lg font-display font-bold text-foreground mb-4 flex items-center gap-2">
                            <FileJson className="w-5 h-5 text-gold" /> Edit Outline
                        </h2>
                        <JSONEditorComponent value={outlineDraft || outline} onChange={setOutlineDraft} />
                        <div className="flex justify-end gap-3 mt-4">
                            <Button variant="destructive" onClick={() => setShowJSONEditor(false)}>Cancel</Button>
                            <Button onClick={handleSaveOutline}>Save</Button>
                        </div>
                    </div>
                </div>
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
                <div className="fixed inset-0 bg-dark/80 backdrop-blur-sm flex justify-center items-center z-50">
                    <div className="bg-darkSurface border border-darkBorder p-5 rounded-2xl w-3/4 max-w-2xl">
                        <h2 className="text-lg font-display font-bold text-foreground mb-4">Image Preview</h2>
                        <img src={previewImage} alt="Preview" className="w-full h-auto rounded-xl" />
                        <button
                            className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm hover:bg-red-500/20 transition-colors"
                            onClick={() => setPreviewImage(null)}
                        >
                            <X className="w-4 h-4" /> Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AIContentGenerator;
