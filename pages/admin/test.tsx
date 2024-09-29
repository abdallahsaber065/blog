// SamplePage.tsx
import React, { useState } from 'react';
import Editor from '@/components/admin/Editor';

const Test = () => {
    const [markdown, setMarkdown] = useState<string>('# Hello, world!\n\nThis is a sample markdown content.');

    const handleMarkdownChange = (newMarkdown: string) => {
        setMarkdown(newMarkdown);
    };

    return (
        <div>
            <h1>Markdown Editor</h1>
            <Editor markdown={markdown} onChange={handleMarkdownChange} />
            <div style={{ marginTop: '20px' }}>
                <h2>Preview</h2>
                <div dangerouslySetInnerHTML={{ __html: markdown }} />
            </div>
        </div>
    );
};

export default Test;