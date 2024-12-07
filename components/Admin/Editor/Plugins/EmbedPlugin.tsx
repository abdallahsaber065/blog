import * as React from "react";
// Embed icon from react-icons {not FaFile because it's already used}
import { PiPlugsConnectedFill } from "react-icons/pi";
// Using type assertion for the dynamic import
export default class EmbedPlugin extends (await import('react-markdown-editor-lite')).PluginComponent {
    static pluginName: string = "EmbedPlugin";
    static align: "left" | "right" = "left";

    constructor(props: any) {
        super(props);

        this.handleClick = this.handleClick.bind(this);

        this.state = {
            num: this.getConfig("start")
        };
    }

    handleClick(): void {
        this.editor.insertText("<Embed src='' alt='' />");
    }

    render(): React.ReactElement {
        return (
            <span
                className="button button-type-counter"
                title="Insert Embed ex. Youtube, Gdrive, etc."
                onClick={this.handleClick}
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}
            >
                <PiPlugsConnectedFill
                    style={{
                        height: '18.5px',
                        width: '18px'
                    }}
                />
            </span>
        );
    }
}