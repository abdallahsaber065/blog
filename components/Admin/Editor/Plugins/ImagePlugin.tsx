import * as React from "react";
// image icon from react-icons
import { IoImage } from "react-icons/io5";
// Using type assertion for the dynamic import
export default class ImagePlugin extends (await import('react-markdown-editor-lite')).PluginComponent {
    static pluginName: string = "ImagePlugin";
    static align: "left" | "right" = "left";

    constructor(props: any) {
        super(props);

        this.handleClick = this.handleClick.bind(this);

        this.state = {
            num: this.getConfig("start")
        };
    }

    handleClick(): void {
        this.editor.insertText("<Image src='' alt='' />");
    }

    render(): React.ReactElement {
        return (
            <span
                className="button button-type-counter"
                title="Insert Image"
                onClick={this.handleClick}
                style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}

            >
                <IoImage
                    style={{
                        height: '18.5px',
                        width: '18px'
                    }}
                />
            </span>
        );
    }
}