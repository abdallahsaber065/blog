'use client';
import '@mdxeditor/editor/style.css';
import React from 'react';
import 'react-markdown-editor-lite/lib/index.css';
import MarkdownIt from 'markdown-it';
import dynamic from 'next/dynamic';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css'; // You can choose any highlight.js theme

// Dynamically import the Markdown editor to avoid SSR issues
const MdEditor = dynamic(() => import('react-markdown-editor-lite'), { ssr: false });

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
}

const Editor = ({ markdown, onChange, parseMarkdown, onScroll }: EditorProps) => {
    return (
        <MdEditor
            onScroll={onScroll}
            style={{
                height: "500px",
            }}
            renderHTML={(text) => (parseMarkdown ? parseMarkdown(text) : mdParser.render(text))}
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
            onChange={({ text }) => onChange(text)}
            value={markdown}
        />
    );
}

export default Editor;