import * as React from "react";
import { BsFileEarmarkRichtextFill } from "react-icons/bs";
import { FILE_EXTENSIONS } from "../../FileIcons";
import FileSelector from "../../FileSelector";
import { PluginComponent } from "./types";

interface FilePluginState {
    isFileSelectorOpen: boolean;
}

export default class FilePlugin extends PluginComponent<{}, FilePluginState> {
    static pluginName: string = "FilePlugin";
    static align: "left" | "right" = "left";

    state: FilePluginState;
    constructor(props: any) {
        super(props);

        this.handleClick = this.handleClick.bind(this);
        this.handleFileSelect = this.handleFileSelect.bind(this);
        this.closeFileSelector = this.closeFileSelector.bind(this);

        this.state = {
            isFileSelectorOpen: false,
        };
    }

    handleClick(): void {
        this.setState({ isFileSelectorOpen: true });
    }

    handleFileSelect(file: any): void {
        this.editor.insertText(`<File src='${file.file_url}' alt='${file.file_name}' filename='${file.file_name}' />`);
        this.setState({ isFileSelectorOpen: false });
    }

    closeFileSelector(): void {
        this.setState({ isFileSelectorOpen: false });
    }

    render(): React.ReactElement {
        return (
            <>
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
                {this.state.isFileSelectorOpen && (
                    <FileSelector
                        isOpen={this.state.isFileSelectorOpen}
                        onClose={this.closeFileSelector}
                        onSelect={this.handleFileSelect}
                        allowedTypes={FILE_EXTENSIONS}
                    />
                )}
            </>
        );
    }
}