import * as React from "react";
// Section icon from react-icons {not FaFile because it's already used}
import { TbLayoutSidebarRightCollapseFilled } from "react-icons/tb";// Using type assertion for the dynamic import
export default class SectionPlugin extends (await import('react-markdown-editor-lite')).PluginComponent {
    static pluginName: string = "SectionPlugin";
    static align: "left" | "right" = "left";

    constructor(props: any) {
        super(props);

        this.handleClick = this.handleClick.bind(this);
    }

    handleClick(): void {
        this.editor.insertText('<details>\n\t<summary>Put your title here</summary>\n\tAnything you want to put here\n</details>');
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