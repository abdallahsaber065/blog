'use client';
// You can use this code in a separate component that's imported in your pages.
import type { CodeBlockEditorDescriptor } from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';
import React from 'react';
import 'react-markdown-editor-lite/lib/index.css';
import MarkdownIt from 'markdown-it';
import dynamic from 'next/dynamic';

// Dynamically import the Markdown editor to avoid SSR issues
const MdEditor = dynamic(() => import('react-markdown-editor-lite'), { ssr: false });
const mdParser = new MarkdownIt();


interface EditorProps {
    markdown: string;
    onChange: (markdown: string) => void;
    parseMarkdown?: (markdown: string) => string;
}


const Editor = ({ markdown, onChange, parseMarkdown } : EditorProps) => {
    return (
        
        <MdEditor
            value={markdown}
            style={{ height: '500px' }}
            renderHTML={(text) => (parseMarkdown ? parseMarkdown(text) : mdParser.render(text))}
            onChange={({ text }) => onChange(text)}
        />

    );
}

export default Editor;