'use client';
// You can use this code in a separate component that's imported in your pages.
import type { CodeBlockEditorDescriptor } from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';
import React from 'react';
import { MDXEditor, codeBlockPlugin, headingsPlugin, listsPlugin, linkPlugin, quotePlugin, markdownShortcutPlugin, useCodeBlockEditorContext, toolbarPlugin, KitchenSinkToolbar, linkDialogPlugin, AdmonitionDirectiveDescriptor, codeMirrorPlugin, diffSourcePlugin, directivesPlugin, frontmatterPlugin, imagePlugin, sandpackPlugin, tablePlugin, thematicBreakPlugin } from '@mdxeditor/editor';

const PlainTextCodeEditorDescriptor: CodeBlockEditorDescriptor = {
    match: () => true,
    priority: 0,
    Editor: (props) => {
        const cb = useCodeBlockEditorContext();
        return (
            <div onKeyDown={(e) => e.nativeEvent.stopImmediatePropagation()}>
                <textarea rows={3} cols={20} defaultValue={props.code} onChange={(e) => cb.setCode(e.target.value)} />
            </div>
        );
    }
}

interface EditorProps {
    markdown: string;
    onChange: (value: string) => void;
}

const Editor = ({ markdown , onChange} : EditorProps) => {
    return (
        
        <MDXEditor
            markdown={markdown}
            plugins={[
                toolbarPlugin({ toolbarContents: () => <KitchenSinkToolbar /> }),
                listsPlugin(),
                quotePlugin(),
                headingsPlugin(),
                linkPlugin(),
                linkDialogPlugin(),
                imagePlugin(),
                tablePlugin(),
                thematicBreakPlugin(),
                frontmatterPlugin(),
                codeBlockPlugin({ defaultCodeBlockLanguage: 'txt' }),
                codeMirrorPlugin({ codeBlockLanguages: { js: 'JavaScript', css: 'CSS', txt: 'text', tsx: 'TypeScript' } }),
                directivesPlugin({ directiveDescriptors: [ AdmonitionDirectiveDescriptor] }),
                diffSourcePlugin({ viewMode: 'rich-text', diffMarkdown: 'boo' }),
                markdownShortcutPlugin()
            ]}
        />

    );
}

export default Editor;