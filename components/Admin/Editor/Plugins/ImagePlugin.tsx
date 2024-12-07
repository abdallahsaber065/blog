import * as React from "react";
import { IoImage } from "react-icons/io5";
import ImageSelector from "../../ImageSelector"; // Adjust the import path as necessary

interface ImagePluginState {
    isImageSelectorOpen: boolean;
}

export default class ImagePlugin extends (await import('react-markdown-editor-lite')).PluginComponent {
    static pluginName: string = "ImagePlugin";
    static align: "left" | "right" = "left";

    state: ImagePluginState;

    constructor(props: any) {
        super(props);

        this.handleClick = this.handleClick.bind(this);
        this.handleImageSelect = this.handleImageSelect.bind(this);
        this.closeImageSelector = this.closeImageSelector.bind(this);

        this.state = {
            isImageSelectorOpen: false,
        };
    }

    handleClick(): void {
        this.setState({ isImageSelectorOpen: true });
    }

    handleImageSelect(image: any): void {
        this.editor.insertText(`<Image src='${image.file_url}' alt='${image.file_name}' />`);
        this.setState({ isImageSelectorOpen: false });
    }

    closeImageSelector(): void {
        this.setState({ isImageSelectorOpen: false });
    }

    render(): React.ReactElement {
        return (
            <>
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
                {this.state.isImageSelectorOpen && (
                    <ImageSelector
                        isOpen={this.state.isImageSelectorOpen}
                        onClose={this.closeImageSelector}
                        onSelect={this.handleImageSelect}
                    />
                )}
            </>
        );
    }
}