'use client';
import '@mdxeditor/editor/style.css';
import React, { useState } from 'react';
import 'react-markdown-editor-lite/lib/index.css';
import MarkdownIt from 'markdown-it';
import dynamic from 'next/dynamic';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css'; // You can choose any highlight.js theme

const MdEditor = dynamic(
    async () => {
        const [MdEditor,ImagePlugin, FilePlugin, InlineFilePlugin, EmbedPlugin, SectionPlugin] = await Promise.all([
            import('react-markdown-editor-lite'),
            import('./Editor/Plugins/ImagePlugin'),
            import('./Editor/Plugins/FilePlugin'),
            import('./Editor/Plugins/InlineFilePlugin'),
            import('./Editor/Plugins/EmbedPlugin'),
            import('./Editor/Plugins/SectionPlugin'),
            /** Add more plugins, and use below */
        ]);
        MdEditor.default.use(ImagePlugin.default);
        MdEditor.default.use(FilePlugin.default);
        MdEditor.default.use(InlineFilePlugin.default);
        MdEditor.default.use(EmbedPlugin.default);
        MdEditor.default.use(SectionPlugin.default);
        return MdEditor.default;
    },
    {
        ssr: false,
    },
);

// Configure markdown-it with highlight.js
const mdParser = new MarkdownIt({
    highlight: function (str: string, lang: string): string {
        if (lang && hljs.getLanguage(lang)) {
            try {
                return '<pre class="hljs"><code>' +
                    hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
                    '</code></pre>';
            } catch (__) { }
        }
        return '<pre class="hljs"><code>' + mdParser.utils.escapeHtml(str) + '</code></pre>';
    }
});

interface EditorProps {
    markdown: string;
    onChange: (markdown: string) => void;
    parseMarkdown?: (markdown: string) => string;
    onScroll?: (e: React.UIEvent<HTMLTextAreaElement | HTMLDivElement>, type: 'md' | 'html') => void;
    editorRef?: React.MutableRefObject<HTMLDivElement>;
    isFullScreen?: boolean;
}

const Editor = ({ markdown, onChange, parseMarkdown, onScroll, editorRef, isFullScreen }: EditorProps) => {
    const [error, setError] = useState<string | null>(null);

    const handleChange = ({ text }: { text: string }) => {
        try {
            onChange(text);
            setError(null); // Clear any previous errors
        } catch (err) {
            setError('Error while updating the content.');
        }
    };

    const renderHTML = (text: string) => {
        try {
            return parseMarkdown ? parseMarkdown(text) : mdParser.render(text);
        } catch (err) {
            setError('Error while parsing the content.');
            return '<p>Error while parsing the content.</p>';
        }
    };

    return (
        <div className="h-full">
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-3 py-2 rounded text-sm mb-2">
                    {error}
                </div>
            )}
            <MdEditor
                className="markdown-editor-main"
                markdownClass="editor-class"
                onScroll={onScroll}
                style={{
                    height: "100%",
                }}
                renderHTML={renderHTML}
                config={{
                    view: {
                        menu: true,
                        md: true,
                        html: false,
                    },
                    canView: {
                        menu: true,
                        md: true,
                        html: true,
                        fullScreen: true,
                        hideMenu: false,
                        both: false,
                    },
                    shortcuts: true,
                }}
                plugins={[
                    'header',
                    'font-bold',
                    'font-italic',
                    'font-underline',
                    'font-strikethrough',
                    'list-unordered',
                    'list-ordered',
                    'block-quote',
                    'block-wrap',
                    'block-code-inline',
                    'block-code-block',
                    'table',
                    'image',
                    'link',
                    'ImagePlugin',
                    'FilePlugin',
                    'InlineFilePlugin',
                    'EmbedPlugin',
                    'SectionPlugin',
                    'logger',
                    'clear',
                    'undo',
                    'redo',
                ]}
                onChange={handleChange}
                value={markdown}
                syncScrollMode={['rightFollowLeft', 'leftFollowRight']}
            />
        </div>
    );
}

export default Editor;