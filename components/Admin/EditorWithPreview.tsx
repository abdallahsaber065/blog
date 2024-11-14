import React, { useState, useRef, useEffect } from 'react';
import Editor from "@/components/Admin/Editor";
import RenderMdx from '@/components/Blog/RenderMdxDev';
import CustomImageUpload from '@/components/MdxComponents/Image/CustomImageUpload';
import CustomFileUpload from '@/components/MdxComponents/File/CustomFileUpload';
import InlineFileUpload from '@/components/MdxComponents/File/InlineFileUpload';

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
        const fileRegex = /<File\s+[^>]*src="(?!.*#id=)[^"]*"[^>]*>/g;
        const inlineFileRegex = /<InlineFile\s+[^>]*src="(?!.*#id=)[^"]*"[^>]*>/g;
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
            if (!markdownText) {
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

    const handleEditorScroll = (e: React.UIEvent<HTMLTextAreaElement | HTMLDivElement>, type: 'md' | 'html') => {
        if (type === 'md' && previewRef.current) {
            const editorElement = e.target as HTMLTextAreaElement | HTMLDivElement;
            const scrollPercentage = editorElement.scrollTop / (editorElement.scrollHeight - editorElement.clientHeight);
            previewRef.current.scrollTop = scrollPercentage * (previewRef.current.scrollHeight - previewRef.current.clientHeight);
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
        const fileRegex = type === "File" ? /<File\s+[^>]*src=".*?"[^>]*>/g : /<InlineFile\s+[^>]*src=".*?"[^>]*>/g;
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
    };

    return (
        <div className="flex flex-col sm:flex-row text-slate-900 dark:text-slate-300">
            <div className="sm:hidden flex justify-center my-1">
                <label className="flex cursor-pointer gap-2 items-center">
                    <span className="label-text text-lg text-sky-900 dark:text-sky-300">Editor</span>
                    <input
                        type="checkbox"
                        className="toggle border-blue-500 bg-blue-500 [--tglbg:yellow] hover:bg-blue-700"
                        checked={view === 'preview'}
                        onChange={() => setView(view === 'editor' ? 'preview' : 'editor')}
                    />
                    <span className="label-text text-lg text-lime-950 dark:text-lime-300">Preview</span>
                </label>
            </div>
            <div className={`w-full sm:w-1/2 pr-2 ${view === 'preview' ? 'hidden sm:block' : ''}`}>
                <label className="block text-xl font-bold text-gray dark:text-lightgray my-4">Content</label>
                <Editor
                    markdown={markdownText}
                    onChange={onContentChange}
                    onScroll={(e) => handleEditorScroll(e, 'md')}
                />
            </div>
            <div className={`w-full sm:w-1/2 pl-2 ${view === 'editor' ? 'hidden sm:block' : ''}`}>
                <h2 className="text-xl font-bold my-4">Preview</h2>
                <div ref={previewRef} style={{ height: '500px', overflowY: 'scroll' }}>
                    {error ? (
                        <p className="text-red-500">{error}</p>
                    ) : mdxSource ? (
                        <RenderMdx mdxSource={mdxSource} additionalComponents={mdxComponents} mdxText={markdownText} />
                    ) : (
                        <p>No preview available</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EditorWithPreview;