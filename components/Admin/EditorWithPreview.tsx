import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import dynamic from 'next/dynamic';
import type { MDXEditorMethods } from '@mdxeditor/editor';
import RenderMdxDev from '@/components/Blog/RenderMdxDev';
import CustomImageUpload from '@/components/MdxComponents/Image/CustomImageUpload';
import CustomFileUpload from '@/components/MdxComponents/File/CustomFileUpload';
import InlineFileUpload from '@/components/MdxComponents/File/InlineFileUpload';
import FileResource from '@/components/MdxComponents/File/FileResource';
import Embed from '@/components/MdxComponents/Embed/Embed';
import { FaEye, FaArrowLeft } from 'react-icons/fa';
import BlogTemplate from '@/components/Blog/BlogTemplate';

// Dynamic import for SSR-free MDX Editor
const Editor = dynamic(() => import('@/components/Admin/Editor'), { ssr: false });

interface EditorWithPreviewProps {
    markdownText: string;
    onContentChange: (value: string) => void;
    className?: string;
    title?: string;
    category?: { label: string; value: string } | null;
    tags?: { label: string; value: string }[];
    featuredImage?: string;
    excerpt?: string;
    isLivePreview: boolean;
    setIsLivePreview: (value: boolean) => void;
    diffMarkdown?: string;
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

const EditorWithPreview: React.FC<EditorWithPreviewProps> = ({
    markdownText,
    onContentChange,
    title = "Untitled Post",
    category,
    tags = [],
    featuredImage,
    excerpt,
    isLivePreview,
    setIsLivePreview,
    diffMarkdown
}) => {
    const [mdxSource, setMdxSource] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);
    const editorRef = useRef<MDXEditorMethods>(null);
    const previewRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (isLivePreview) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isLivePreview]);

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

            // OPTIMIZATION: Only parse and fetch when Live Preview is open
            if (!isLivePreview) {
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
    }, [isLivePreview, markdownText]);

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

    const mockPost = {
        title: title,
        excerpt: excerpt,
        content: markdownText,
        featured_image_url: featuredImage,
        tags: tags.map(tag => ({ name: tag.label, slug: tag.value })),
        category: category ? { name: category.label, slug: category.value } : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        published_at: null,
        status: 'draft'
    };

    return (
        <>
            {/* Live Preview Overlay */}
            {isLivePreview && mounted && createPortal(
                <div id="live-preview-scroll-container" className="fixed inset-0 z-[100] bg-white dark:bg-dark overflow-y-auto animate-in fade-in duration-300">
                    <div className="sticky top-0 z-50 bg-white/80 dark:bg-dark/80 backdrop-blur-md border-b border-lightBorder dark:border-darkBorder px-4 py-3 flex items-center justify-between shadow-sm">
                        <button
                            onClick={() => setIsLivePreview(false)}
                            className="flex items-center gap-2 px-4 py-2 bg-light dark:bg-darkSurface hover:bg-gold/10 dark:hover:bg-gold/15 text-foreground rounded-full font-medium transition-all duration-200 border border-lightBorder dark:border-darkBorder"
                        >
                            <FaArrowLeft />
                            Back to Editor
                        </button>
                        <span className="font-semibold text-muted-foreground">Live Preview Mode</span>
                        <div className="w-24"></div>
                    </div>
                    <div>
                        {mdxSource ? (
                            <BlogTemplate post={mockPost} mdxSource={mdxSource} isPreview={true} scrollContainerId="live-preview-scroll-container" />
                        ) : (
                            <div className="h-[80vh] flex items-center justify-center">
                                <p className="text-xl text-muted-foreground">Loading content...</p>
                            </div>
                        )}
                    </div>
                </div>,
                document.body
            )}

            {/* Full-width Editor */}
            <div className="editor-container relative flex-1 flex flex-col min-h-[500px]">
                {/* Editor */}
                <div className="border-t border-lightBorder dark:border-darkBorder bg-white dark:bg-darkElevated flex-1 flex flex-col">
                    <Editor
                        markdown={markdownText}
                        onChange={onContentChange}
                        editorRef={editorRef}
                        diffMarkdown={diffMarkdown}
                    />
                </div>
            </div>
        </>
    );
};

export default EditorWithPreview;