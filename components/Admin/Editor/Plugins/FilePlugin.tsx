import * as React from "react";
// file icon from react-icons
import { BsFileEarmarkRichtextFill } from "react-icons/bs";

// Using type assertion for the dynamic
export default class FilePlugin extends (await import('react-markdown-editor-lite')).PluginComponent {
    static pluginName: string = "FilePlugin";
    static align: "left" | "right" = "left";

    constructor(props: any) {
        super(props);

        this.handleClick = this.handleClick.bind(this);

        this.state = {
            num: this.getConfig("start")
        };
    }

    handleClick(): void {
        this.editor.insertText("<File src='' alt='' />");
    }

    render(): React.ReactElement {
        return (
            <span
                className="button button-type-counter"
                title="Insert File"
                onClick={this.handleClick}
                style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            >
                <BsFileEarmarkRichtextFill
                    style={{
                        height: '18.5px',
                        width: '18px'
                    }}
                />
            </span>
        );
    }
}