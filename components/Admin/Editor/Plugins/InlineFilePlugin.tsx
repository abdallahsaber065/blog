import * as React from "react";
// InlineFile icon from react-icons {not FaFile because it's already used}
import { FaFileInvoice } from "react-icons/fa6";

// Using type assertion for the dynamic import
export default class InlineFilePlugin extends (await import('react-markdown-editor-lite')).PluginComponent {
    static pluginName: string = "InlineFilePlugin";
    static align: "left" | "right" = "left";

    constructor(props: any) {
        super(props);

        this.handleClick = this.handleClick.bind(this);

        this.state = {
            num: this.getConfig("start")
        };
    }

    handleClick(): void {
        this.editor.insertText("<InlineFile src='' alt='' />");
    }

    render(): React.ReactElement {
        return (
            <span
                className="button button-type-counter"
                title="Insert Inline File"
                onClick={this.handleClick}
                style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            >
                <FaFileInvoice
                    style={{
                        height: '18.5px',
                        width: '18px'
                    }}
                />
            </span>
        );
    }
}