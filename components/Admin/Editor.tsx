'use client';
import React, { forwardRef } from 'react';
import '@mdxeditor/editor/style.css';
import {
    MDXEditor,
    MDXEditorMethods,
    headingsPlugin,
    listsPlugin,
    quotePlugin,
    thematicBreakPlugin,
    linkPlugin,
    linkDialogPlugin,
    tablePlugin,
    codeBlockPlugin,
    codeMirrorPlugin,
    toolbarPlugin,
    diffSourcePlugin,
    jsxPlugin,
    markdownShortcutPlugin,
    imagePlugin,
    GenericJsxEditor,
    JsxComponentDescriptor,
    // Toolbar components
    UndoRedo,
    BoldItalicUnderlineToggles,
    BlockTypeSelect,
    ListsToggle,
    CreateLink,
    InsertTable,
    InsertCodeBlock,
    InsertThematicBreak,
    InsertImage,
    Separator,
    DiffSourceToggleWrapper,
    CodeToggle,
    StrikeThroughSupSubToggles,
    ConditionalContents,
} from '@mdxeditor/editor';

import {
    InsertCustomImage,
    InsertCustomFile,
    InsertInlineFile,
    InsertEmbed,
    InsertSection,
} from './Editor/MdxEditorToolbarButtons';

// JSX component descriptors for custom MDX components
const jsxComponentDescriptors: JsxComponentDescriptor[] = [
    {
        name: 'Image',
        kind: 'flow',
        props: [
            { name: 'src', type: 'string', required: true },
            { name: 'alt', type: 'string' },
            { name: 'width', type: 'expression' },
            { name: 'height', type: 'expression' },
            { name: 'id', type: 'string' },
        ],
        hasChildren: false,
        Editor: GenericJsxEditor,
    },
    {
        name: 'File',
        kind: 'flow',
        props: [
            { name: 'src', type: 'string', required: true },
            { name: 'filename', type: 'string' },
            { name: 'alt', type: 'string' },
            { name: 'id', type: 'string' },
        ],
        hasChildren: false,
        Editor: GenericJsxEditor,
    },
    {
        name: 'InlineFile',
        kind: 'text',
        props: [
            { name: 'src', type: 'string', required: true },
            { name: 'filename', type: 'string' },
            { name: 'alt', type: 'string' },
            { name: 'id', type: 'string' },
        ],
        hasChildren: false,
        Editor: GenericJsxEditor,
    },
    {
        name: 'Embed',
        kind: 'flow',
        props: [
            { name: 'src', type: 'string', required: true },
            { name: 'alt', type: 'string' },
            { name: 'height', type: 'string' },
            { name: 'width', type: 'string' },
        ],
        hasChildren: false,
        Editor: GenericJsxEditor,
    },
    {
        name: 'FileResource',
        kind: 'flow',
        props: [
            { name: 'src', type: 'string', required: true },
            { name: 'filename', type: 'string' },
        ],
        hasChildren: false,
        Editor: GenericJsxEditor,
    },
    {
        // Handle <details> blocks as a JSX component
        name: 'details',
        kind: 'flow',
        props: [],
        hasChildren: true,
        Editor: GenericJsxEditor,
    },
    {
        name: 'summary',
        kind: 'flow',
        props: [],
        hasChildren: true,
        Editor: GenericJsxEditor,
    },
];

interface EditorProps {
    markdown: string;
    onChange: (markdown: string) => void;
    editorRef?: React.Ref<MDXEditorMethods>;
    className?: string;
    diffMarkdown?: string;
}

const Editor: React.FC<EditorProps> = ({ markdown, onChange, editorRef, className, diffMarkdown }) => {
    return (
        <div className={`mdx-editor-wrapper h-full ${className || ''}`}>
            <MDXEditor
                ref={editorRef}
                markdown={markdown}
                onChange={onChange}
                className="dark-theme w-full"
                contentEditableClassName="mdx-editor-content prose prose-lg dark:prose-invert max-w-none"
                plugins={[
                    headingsPlugin(),
                    listsPlugin(),
                    quotePlugin(),
                    thematicBreakPlugin(),
                    linkPlugin(),
                    linkDialogPlugin(),
                    tablePlugin(),
                    codeBlockPlugin({ defaultCodeBlockLanguage: 'js' }),
                    codeMirrorPlugin({
                        codeBlockLanguages: {
                            js: 'JavaScript',
                            ts: 'TypeScript',
                            tsx: 'TSX',
                            jsx: 'JSX',
                            css: 'CSS',
                            html: 'HTML',
                            python: 'Python',
                            rust: 'Rust',
                            go: 'Go',
                            bash: 'Bash',
                            shell: 'Shell',
                            json: 'JSON',
                            yaml: 'YAML',
                            sql: 'SQL',
                            graphql: 'GraphQL',
                            markdown: 'Markdown',
                            c: 'C',
                            cpp: 'C++',
                            java: 'Java',
                            php: 'PHP',
                            ruby: 'Ruby',
                            swift: 'Swift',
                            kotlin: 'Kotlin',
                            dart: 'Dart',
                            '': 'Plain Text',
                        },
                    }),
                    imagePlugin(),
                    jsxPlugin({ jsxComponentDescriptors }),
                    diffSourcePlugin({ viewMode: 'rich-text', diffMarkdown: diffMarkdown || markdown }),
                    markdownShortcutPlugin(),
                    toolbarPlugin({
                        toolbarContents: () => (
                            <DiffSourceToggleWrapper>
                                <ConditionalContents
                                    options={[
                                        {
                                            when: (editor) => editor?.editorType === 'codeblock',
                                            contents: () => <></>
                                        },
                                        {
                                            fallback: () => (
                                                <>
                                                    <UndoRedo />
                                                    <Separator />
                                                    <BlockTypeSelect />
                                                    <Separator />
                                                    <BoldItalicUnderlineToggles />
                                                    <StrikeThroughSupSubToggles />
                                                    <CodeToggle />
                                                    <Separator />
                                                    <ListsToggle />
                                                    <Separator />
                                                    <CreateLink />
                                                    <InsertImage />
                                                    <InsertTable />
                                                    <InsertCodeBlock />
                                                    <InsertThematicBreak />
                                                    <Separator />
                                                    {/* Custom MDX component buttons */}
                                                    <InsertCustomImage />
                                                    <InsertCustomFile />
                                                    <InsertInlineFile />
                                                    <InsertEmbed />
                                                    <InsertSection />
                                                </>
                                            )
                                        }
                                    ]}
                                />
                            </DiffSourceToggleWrapper>
                        ),
                    }),
                ]}
            />
        </div>
    );
};

export default Editor;