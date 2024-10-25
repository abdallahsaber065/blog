import React, { useState, useRef, useEffect } from 'react';
import Editor from "@/components/Admin/Editor";
import RenderMdx from '@/components/Blog/RenderMdx';
import CustomImage from '@/components/CustomImage';
import toast from 'react-hot-toast';

interface EditorWithPreviewProps {
    markdownText: string;
    onContentChange: (value: string) => void;
    className?: string;
}

const EditorWithPreview: React.FC<EditorWithPreviewProps> = ({ markdownText, onContentChange }) => {
    const [mdxSource, setMdxSource] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const previewRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchSerializedContent = async () => {
            if (!markdownText) {
                return;
            }
            try {
                const response = await fetch('/api/serializeContent', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ content: markdownText }),
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

    const mdxComponents = () => ({
        Image: (props: any) => <CustomImage {...props} />,
        img: (props: any) => <CustomImage {...props} />,
    });

    return (
        <div className="flex">
            <div className="w-1/2 pr-2">
                <label className="block text-xl font-bold text-gray dark:text-lightgray my-4">Content</label>
                <Editor
                    markdown={markdownText}
                    onChange={onContentChange}
                    onScroll={(e) => handleEditorScroll(e, 'md')}
                />
            </div>
            <div className="w-1/2 pl-2">
                <h2 className="text-xl font-bold my-4">Preview</h2>
                <div ref={previewRef} style={{ height: '500px', overflowY: 'scroll' }}>
                    {error ? (
                        <p className="text-red-500">{error}</p>
                    ) : mdxSource ? (
                        <RenderMdx mdxSource={mdxSource} additionalComponents={mdxComponents()} />
                    ) : (
                        <p>No preview available</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EditorWithPreview;