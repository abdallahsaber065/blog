import * as React from "react";
// Embed icon from react-icons {not FaFile because it's already used}
import { PiPlugsConnectedFill } from "react-icons/pi";
import { PluginComponent } from "./types";

export default class EmbedPlugin extends PluginComponent {
    static pluginName: string = "EmbedPlugin";
    static align: "left" | "right" = "left";

    constructor(props: any) {
        super(props);

        this.handleClick = this.handleClick.bind(this);

    }

    handleClick(): void {
        this.editor.insertText("<Embed src='' alt='' height='auto' width='auto' />");
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