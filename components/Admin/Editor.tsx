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
        const [MdEditor,ImagePlugin, FilePlugin, InlineFilePlugin, EmbedPlugin] = await Promise.all([
            import('react-markdown-editor-lite'),
            import('./Editor/Plugins/ImagePlugin'),
            import('./Editor/Plugins/FilePlugin'),
            import('./Editor/Plugins/InlineFilePlugin'),
            import('./Editor/Plugins/EmbedPlugin'),
            /** Add more plugins, and use below */
        ]);
        MdEditor.default.use(ImagePlugin.default);
        MdEditor.default.use(FilePlugin.default);
        MdEditor.default.use(InlineFilePlugin.default);
        MdEditor.default.use(EmbedPlugin.default);
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
        <div>
            {error && <div className="text-red-500 mb-2">{error}</div>}
            <MdEditor
                className="markdown-editor-main"
                markdownClass="editor-class"
                onScroll={onScroll}
                style={{
                    height: isFullScreen ? "calc(100vh - 3rem)" : "500px",
                }}
                renderHTML={renderHTML}
                canView={{
                    menu: true,
                    md: true,
                    html: true,
                    fullScreen: true,
                    hideMenu: false,
                    both: false,
                }}
                view={{
                    menu: true,
                    md: true,
                    html: false,
                }}
                onChange={handleChange}
                value={markdown}
                syncScrollMode={['rightFollowLeft', 'leftFollowRight']}
            />
        </div>
    );
}

export default Editor;