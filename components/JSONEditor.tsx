// components/JSONEditor.tsx
import { useEffect, useRef } from 'react';
import { createJSONEditor, JSONEditorPropsOptional } from 'vanilla-jsoneditor';

interface JSONEditorProps extends JSONEditorPropsOptional {
    value: any;
    onChange: (value: any) => void;
}

const JSONEditorReact: React.FC<JSONEditorProps> = ({ value, onChange, ...props }) => {
    const refContainer = useRef<HTMLDivElement>(null);
    const refEditor = useRef<ReturnType<typeof createJSONEditor> | null>(null);

    useEffect(() => {
        // create editor
        refEditor.current = createJSONEditor({
            target: refContainer.current!,
            props: {
                content: { json: value },
                onChange: (updatedContent) => {
                    if ('json' in updatedContent) {
                        onChange(updatedContent.json);
                    }
                },
                ...props,
            },
        });

        return () => {
            // destroy editor
            if (refEditor.current) {
                refEditor.current.destroy();
                refEditor.current = null;
            }
        };
    }, []);

    useEffect(() => {
        // update props
        if (refEditor.current) {
            refEditor.current.updateProps({
                content: { json: value },
                ...props,
            });
        }
    }, [value, props]);

    return <div ref={refContainer} style={{ height: '400px' }} />;
};

export default JSONEditorReact;