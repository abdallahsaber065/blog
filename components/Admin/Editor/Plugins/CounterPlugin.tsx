import * as React from "react";
// Dynamic import type only
import type { PluginComponent } from "react-markdown-editor-lite";
interface CounterState {
    num: number;
}

interface CounterConfig {
    start: number;
}

// Using type assertion for the dynamic import
export default class Counter extends (await import('react-markdown-editor-lite')).PluginComponent {
    static pluginName: string = "my-counter";
    static align: "left" | "right" = "left";
    static defaultConfig: CounterConfig = {
        start: 0
    };

    state: CounterState;

    constructor(props: any) {
        super(props);

        this.handleClick = this.handleClick.bind(this);

        this.state = {
            num: this.getConfig("start")
        };
    }

    handleClick(): void {
        this.editor.insertText(this.state.num.toString());
        this.setState({
            num: this.state.num + 1
        });
    }

    render(): React.ReactElement {
        return (
            <span
                className="button button-type-counter"
                title="Counter"
                onClick={this.handleClick}
            >
                {this.state.num}
            </span>
        );
    }
}