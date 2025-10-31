import * as React from "react";
// Section icon from react-icons {not FaFile because it's already used}
import { TbLayoutSidebarRightCollapseFilled } from "react-icons/tb";
import { PluginComponent } from "./types";

export default class SectionPlugin extends PluginComponent {
    static pluginName: string = "SectionPlugin";
    static align: "left" | "right" = "left";

    constructor(props: any) {
        super(props);

        this.handleClick = this.handleClick.bind(this);
    }

    handleClick(): void {
        this.editor.insertText('<details>\n\t<summary>Put your title here</summary>\n\tAnything you want to put here\n</details>',
            false,
            { start: 20, end: 39 }
        );
    }

    render(): React.ReactElement {
        return (
            <span
                className="button button-type-counter"
                title="Insert Section ex. Youtube, Gdrive, etc."
                onClick={this.handleClick}
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}
            >
                <TbLayoutSidebarRightCollapseFilled
                    style={{
                        height: '18.5px',
                        width: '18px'
                    }}
                />
            </span>
        );
    }
}