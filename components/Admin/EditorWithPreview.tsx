import React, { useState, useRef, useEffect, MutableRefObject } from 'react';
import Editor from "@/components/Admin/Editor";
import RenderMdxDev from '@/components/Blog/RenderMdxDev';
import CustomImageUpload from '@/components/MdxComponents/Image/CustomImageUpload';
import CustomFileUpload from '@/components/MdxComponents/File/CustomFileUpload';
import InlineFileUpload from '@/components/MdxComponents/File/InlineFileUpload';
import FileResource from '@/components/MdxComponents/File/FileResource';
import Embed from '@/components/MdxComponents/Embed/Embed';
import { FaExpand, FaCompress, FaBookOpen } from 'react-icons/fa';

interface EditorWithPreviewProps {
    markdownText: string;
    onContentChange: (value: string) => void;
    className?: string;
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

interface FileProps {
    id: string;
    file_name: string;
    file_type: string;
    file_size: number;
    file_url: string;
}

const EditorWithPreview: React.FC<EditorWithPreviewProps> = ({ markdownText, onContentChange }) => {
    const [mdxSource, setMdxSource] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [view, setView] = useState<'editor' | 'preview'>('editor');
    const previewRef = useRef<HTMLDivElement>(null);
    const editorRef = useRef<HTMLDivElement>(null);
    const [isFullScreen, setIsFullScreen] = useState(false);

    useEffect(() => {
        if (isFullScreen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }

        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isFullScreen]);

    const replaceImagesInMarkdown = (text: string): string => {
        const imageRegexes = {
            markdown: /!\[.*?\]\((?!.*#id=)[^\)]*\)/g,
            html: /<img\s+[^>]*src="(?!.*#id=)[^"]*"[^>]*>/g,
            jsx: /<Image\s+[^>]*src="(?!.*#id=)[^"]*"[^>]*>/g,
        };

        const images = {
            markdown: text.match(imageRegexes.markdown) || [],
            html: text.match(imageRegexes.html) || [],
            jsx: text.match(imageRegexes.jsx) || [],
        };

        const convertToJsxImage = (img: string, type: 'markdown' | 'html' | 'jsx'): string => {
            let alt: string, src: string;
            if (type === 'markdown') {
                alt = img.match(/!\[(.*?)\]/)?.[1] || '';
                src = img.match(/\((.*?)\)/)?.[1] || '';
            } else {
                alt = img.match(/alt="(.*?)"/)?.[1] || '';
                src = img.match(/src="(.*?)"/)?.[1] || '';
            }
            return `<Image src="${src}" alt="${alt}" />`;
        };

        const jsxImagesFromMarkdown = images.markdown.map(img => convertToJsxImage(img, 'markdown'));
        const jsxImagesFromHtml = images.html.map(img => convertToJsxImage(img, 'html'));

        let updatedMarkdownText = text;
        jsxImagesFromMarkdown.forEach((img, index) => {
            updatedMarkdownText = updatedMarkdownText.replace(images.markdown[index], img);
        });

        jsxImagesFromHtml.forEach((img, index) => {
            updatedMarkdownText = updatedMarkdownText.replace(images.html[index], img);
        });

        const jsxImages = updatedMarkdownText.match(imageRegexes.jsx) || [];
        const updatedJsxImages = jsxImages.map((img, index) => {
            return img.replace(' />', ` id="${index}" />`);
        });
        updatedJsxImages.forEach((img, index) => {
            updatedMarkdownText = updatedMarkdownText.replace(jsxImages[index], img);
        });

        return updatedMarkdownText;
    };

    const replaceFilesInMarkdown = (text: string): string => {
        const fileRegex = /<File(\s+[^>]*src="(?!.*#id=)[^"]*")?[^>]*>/g;
        const inlineFileRegex = /<InlineFile(\s+[^>]*src="(?!.*#id=)[^"]*")?[^>]*>/g;
        const files = text.match(fileRegex) || [];
        const inlineFiles = text.match(inlineFileRegex) || [];

        const updatedFiles = files.map((file, index) => {
            return file.replace(' />', ` id="${index}" />`);
        });

        const updatedInlineFiles = inlineFiles.map((file, index) => {
            return file.replace(' />', ` id="${index}" />`);
        });

        let updatedMarkdownText = text;
        updatedFiles.forEach((file, index) => {
            updatedMarkdownText = updatedMarkdownText.replace(files[index], file);
        });

        updatedInlineFiles.forEach((file, index) => {
            updatedMarkdownText = updatedMarkdownText.replace(inlineFiles[index], file);
        });

        return updatedMarkdownText;
    };

    useEffect(() => {
        const fetchSerializedContent = async () => {
            if (!markdownText || markdownText.trim() === '') {
                setMdxSource(null);
                setError(null);
                return;
            }
            try {
                let updatedMarkdownText = replaceImagesInMarkdown(markdownText);
                updatedMarkdownText = replaceFilesInMarkdown(updatedMarkdownText);

                const response = await fetch('/api/serializeContent', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ content: updatedMarkdownText }),
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
            } catch (error) {
                setError('An unexpected error occurred');
                setMdxSource(null);
            }
        };

        fetchSerializedContent();
    }, [markdownText]);

    const handleEditorScroll = (e: React.UIEvent<HTMLTextAreaElement | HTMLDivElement>) => {
        const editorElement = e.target as HTMLTextAreaElement | HTMLDivElement;
        const scrollPercentage = editorElement.scrollTop / (editorElement.scrollHeight - editorElement.clientHeight);
        
        console.log('Editor Scroll Event:', {
            scrollTop: editorElement.scrollTop,
            scrollHeight: editorElement.scrollHeight,
            clientHeight: editorElement.clientHeight,
            percentage: scrollPercentage
        });

        if (previewRef.current) {
            const previewElement = previewRef.current;
            const newScrollTop = scrollPercentage * (previewElement.scrollHeight - previewElement.clientHeight);
            console.log('Preview Scroll Calculation:', {
                previewScrollHeight: previewElement.scrollHeight,
                previewClientHeight: previewElement.clientHeight,
                newScrollTop
            });
            previewElement.scrollTop = newScrollTop;
        } else {
            console.log('Preview ref is not available');
        }
    };

    const handleImageChange = (image: ImageProps, alt: string, id: string) => {
        const imageRegex = /(!\[.*?\]\(.*?\)|<img\s+[^>]*src=".*?"[^>]*>|<Image\s+[^>]*src=".*?"[^>]*>)/g;

        const images = markdownText.match(imageRegex) || [];

        if (images[Number(id)]) {
            const updatedImage = `<Image src="${image.file_url}" alt="${alt}" width={${image.width}} height={${image.height}} />`;

            let matchIndex = 0;
            const updatedContent = markdownText.replace(imageRegex, (match) => {
                if (matchIndex === Number(id)) {
                    matchIndex++;
                    return updatedImage;
                }
                matchIndex++;
                return match;
            });

            onContentChange(updatedContent);
        }
    };

    const handleFileChange = (file: FileProps, id: string, type: string = "File") => {
        const fileRegex = type === "File" ? /<File(\s+[^>]*src=".*?")?[^>]*>/g : /<InlineFile(\s+[^>]*src=".*?")?[^>]*>/g;
        const files = markdownText.match(fileRegex) || [];

        if (files[Number(id)]) {
            const updatedFile = type === "File"
                ? `<File src="${file.file_url}" filename="${file.file_name}" id="${id}" />`
                : `<InlineFile src="${file.file_url}" filename="${file.file_name}" id="${id}" />`;

            let matchIndex = 0;
            const updatedContent = markdownText.replace(fileRegex, (match) => {
                if (matchIndex === Number(id)) {
                    matchIndex++;
                    return updatedFile;
                }
                matchIndex++;
                return match;
            });

            onContentChange(updatedContent);
        }
    };

    const mdxComponents = {
        Image: (props: any) => <CustomImageUpload {...props} onImageChange={(image: ImageProps) => handleImageChange(image, props.alt, props.id)} />,
        File: (props: any) => <CustomFileUpload {...props} onFileChange={(file: FileProps) => handleFileChange(file, props.id, "File")} />,
        InlineFile: (props: any) => <InlineFileUpload {...props} onFileChange={(file: FileProps) => handleFileChange(file, props.id, "InlineFile")} />,
        FileResource: (props: any) => <FileResource {...props} />,
        Embed: (props: any) => <Embed {...props} />,
    };

    return (
        <div className={`editor-preview-container text-slate-900 dark:text-slate-300
            ${isFullScreen ? 'fixed top-[64px] left-0 right-0 bottom-0 z-40 bg-white dark:bg-dark p-4' : 'relative'}`}>
            
            {/* Header with Focus Mode Button */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                    {/* Mobile Toggle */}
                    <div className="sm:hidden">
                        <label className="flex cursor-pointer gap-2 items-center bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600">
                            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Editor</span>
                            <input
                                type="checkbox"
                                className="toggle toggle-sm border-blue-500 bg-blue-500 [--tglbg:yellow] hover:bg-blue-700"
                                checked={view === 'preview'}
                                onChange={() => setView(view === 'editor' ? 'preview' : 'editor')}
                            />
                            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Preview</span>
                        </label>
                    </div>
                </div>
                
                {/* Focus Mode Button */}
                <button 
                    className="ml-auto px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-slate-300 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-700 flex items-center gap-2 shadow-sm hover:shadow transition-all duration-200 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400"
                    onClick={() => setIsFullScreen(!isFullScreen)}
                    title={isFullScreen ? "Exit focus mode" : "Enter focus mode"}
                >
                    <span className="text-sm font-medium">
                        {isFullScreen ? "Exit Focus" : "Focus Mode"}
                    </span>
                    {isFullScreen ? <FaCompress className="text-sm" /> : <FaExpand className="text-sm" />}
                </button>
            </div>

            {/* Editor and Preview Container */}
            <div className="flex flex-col sm:flex-row gap-4 h-full">
                {/* Editor Section */}
                <div className={`editor-preview-editor-section w-full sm:w-1/2 ${view === 'preview' ? 'hidden sm:block' : ''}`}>
                    <div className="flex items-center justify-between mb-3">
                        <label className="editor-preview-content-label text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                            <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
                            Content
                        </label>
                        <button
                            onClick={() => fetch('/static/editor_guide.md')
                                .then(res => res.text())
                                .then(text => onContentChange(text))
                                .catch(err => console.error('Error loading example:', err))}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-all duration-200 shadow-sm hover:shadow"
                            title="Load example content"
                        >
                            <FaBookOpen className="text-sm" />
                            <span>Load Example</span>
                        </button>
                    </div>
                    <div className="border border-slate-300 dark:border-slate-600 rounded-lg overflow-hidden shadow-sm" 
                         style={{ height: isFullScreen ? 'calc(100vh - 180px)' : '600px' }}>
                        <Editor
                            markdown={markdownText}
                            onChange={onContentChange}
                            onScroll={handleEditorScroll}
                            editorRef={editorRef as MutableRefObject<HTMLDivElement>}
                            isFullScreen={isFullScreen}
                        />
                    </div>
                </div>

                {/* Preview Section */}
                <div className={`editor-preview-preview-section w-full sm:w-1/2 ${view === 'editor' ? 'hidden sm:block' : ''}`}>
                    <div className="flex items-center mb-3">
                        <h2 className="editor-preview-preview-title text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                            <span className="w-1 h-6 bg-green-500 rounded-full"></span>
                            Preview
                        </h2>
                    </div>
                    <div className="border border-slate-300 dark:border-slate-600 rounded-lg overflow-hidden shadow-sm bg-white dark:bg-slate-900" 
                         style={{ height: isFullScreen ? 'calc(100vh - 180px)' : '600px' }}>
                        <div className="h-full overflow-y-auto p-6">
                            {error ? (
                                <div className="flex items-center justify-center h-full">
                                    <p className="text-red-500 font-medium">{error}</p>
                                </div>
                            ) : !mdxSource ? (
                                <div className="flex items-center justify-center h-full text-slate-400 dark:text-slate-500">
                                    <p className="text-sm">No content to preview</p>
                                </div>
                            ) : (
                                <RenderMdxDev 
                                    mdxSource={mdxSource} 
                                    additionalComponents={mdxComponents} 
                                    mdxText={markdownText} 
                                    previewRef={previewRef as MutableRefObject<HTMLDivElement>} 
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditorWithPreview;