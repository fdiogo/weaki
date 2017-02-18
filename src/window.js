import { ipcRenderer } from 'electron';
import React from 'react';
import { render } from 'react-dom';

import Explorer from './components/explorer/explorer';
import Editor from './components/editor/editor';
import StatusBar from './components/status-bar/status-bar';

/**
 * This component represents the main window of the application
 * which contains all the other components.
 */
class Window extends React.Component {

    constructor (props) {
        super(props);
        this.state = {
            file: '',
            filePath: ''
        };

        ipcRenderer.on('editor:file-loaded', this.onFileLoaded.bind(this));
    }

    /**
     * The handler of the channel 'editor:file-loaded'.
     * @param {Object} event - The event descriptor
     * @param {Object} payload - A descriptor of the file {filePath, contents}
     */
    onFileLoaded (event, payload) {
        this.setState({
            file: payload.contents,
            filePath: payload.filePath
        });
    }

    render () {
        return <div id="viewport">
            <div id="workspace">
                <div id="left-sidebar">
                    <Explorer name='hey'></Explorer>
                </div>
                <div id="main-panel">
                    <Editor content={this.state.file}></Editor>
                </div>
                <div id="right-sidebar">
                </div>
            </div>
            <div id="status-bar">
                <StatusBar filePath={this.state.filePath}></StatusBar>
            </div>
        </div>;
    }
};

render(
    <Window></Window>,
    document.getElementById('root')
);
