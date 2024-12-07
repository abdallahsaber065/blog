import * as React from "react";
import { FaFileInvoice } from "react-icons/fa6";
import FileSelector from "../../FileSelector"; // Adjust the import path as necessary

interface InlineFilePluginState {
    isFileSelectorOpen: boolean;
}

export default class InlineFilePlugin extends (await import('react-markdown-editor-lite')).PluginComponent {
    static pluginName: string = "InlineFilePlugin";
    static align: "left" | "right" = "left";

    state: InlineFilePluginState;

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
        this.editor.insertText(`<InlineFile src='${file.file_url}' alt='${file.file_name}' filename='${file.file_name}' />`);
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
                {this.state.isFileSelectorOpen && (
                    <FileSelector
                        isOpen={this.state.isFileSelectorOpen}
                        onClose={this.closeFileSelector}
                        onSelect={this.handleFileSelect}
                        allowedTypes={['.jpg', '.jpeg', '.png', '.gif']} // Adjust allowed types as necessary
                    />
                )}
            </>
        );
    }
}