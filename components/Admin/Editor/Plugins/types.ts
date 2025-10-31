// Type definitions for react-markdown-editor-lite plugins
// This file provides types without requiring top-level await
import * as React from "react";

export interface Editor {
    insertText: (text: string, replaceSelected?: boolean, selection?: { start: number; end: number }) => void;
}

export interface PluginProps {
    editor: Editor;
    config: any;
}

export abstract class PluginComponent<P = {}, S = {}> extends React.Component<PluginProps & P, S> {
    static pluginName: string;
    static align: "left" | "right";

    editor: Editor;
    config: any;

    constructor(props: PluginProps & P) {
        super(props);
        this.editor = props.editor;
        this.config = props.config;
    }

    abstract render(): React.ReactElement;
}
