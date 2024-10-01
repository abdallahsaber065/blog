'use client';
// You can use this code in a separate component that's imported in your pages.
import '@mdxeditor/editor/style.css';
import React from 'react';
import 'react-markdown-editor-lite/lib/index.css';
import MarkdownIt from 'markdown-it';
import dynamic from 'next/dynamic';
// import { MDXEditor, codeBlockPlugin, headingsPlugin, listsPlugin, linkPlugin, quotePlugin, markdownShortcutPlugin, useCodeBlockEditorContext, toolbarPlugin, KitchenSinkToolbar, linkDialogPlugin, AdmonitionDirectiveDescriptor, codeMirrorPlugin, diffSourcePlugin, directivesPlugin, frontmatterPlugin, imagePlugin, tablePlugin, thematicBreakPlugin, DiffSourceToggleWrapper } from '@mdxeditor/editor';

// Dynamically import the Markdown editor to avoid SSR issues
const MdEditor = dynamic(() => import('react-markdown-editor-lite'), { ssr: false });
const mdParser = new MarkdownIt();


interface EditorProps {
    markdown: string;
    onChange: (markdown: string) => void;
    parseMarkdown?: (markdown: string) => string;
    onScroll?: (e: React.UIEvent<HTMLTextAreaElement | HTMLDivElement>, type: 'md' | 'html') => void;
}


const Editor = ({ markdown, onChange, parseMarkdown , onScroll} : EditorProps) => {
    return (
        
        // <MDXEditor
            
        //     markdown={markdown}
        //     onChange={onChange}
        //     plugins={[
        //         toolbarPlugin({ toolbarContents: () => <KitchenSinkToolbar /> }),
        //         listsPlugin(),
        //         quotePlugin(),
        //         headingsPlugin(),
        //         linkPlugin(),
        //         linkDialogPlugin(),
        //         imagePlugin(),
        //         tablePlugin(),
        //         thematicBreakPlugin(),
        //         frontmatterPlugin(),
        //         codeBlockPlugin({ defaultCodeBlockLanguage: 'txt' }),
        //         codeMirrorPlugin({ codeBlockLanguages: { js: 'JavaScript', css: 'CSS', txt: 'text', tsx: 'TypeScript', html: 'HTML' } }),
        //         directivesPlugin({ directiveDescriptors: [ AdmonitionDirectiveDescriptor] }),
        //         diffSourcePlugin({ viewMode: 'rich-text'}),
        //         markdownShortcutPlugin()
        //     ]}
        // />

        // lite editor
        <MdEditor
            onScroll={onScroll}
            style={{ height: "500px" }}
            renderHTML={(text) => (parseMarkdown ? parseMarkdown(text) : mdParser.render(text))}
            onChange={({ text }) => onChange(text)}
            value={markdown}
        />

    );
}

export default Editor;