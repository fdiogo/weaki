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
            openFiles: {},
            currentFilePath: null
        };

        ipcRenderer.on('editor:file-loaded', this.onFileLoaded.bind(this));
        ipcRenderer.on('editor:current-file-request', this.onCurrentFileRequest.bind(this));
        ipcRenderer.on('editor:close-file', this.onCloseFile.bind(this));
    }

    render () {
        return <div id="viewport">
            <div id="workspace">
                <div id="left-sidebar">
                    <Explorer openFiles={Object.keys(this.state.openFiles)}></Explorer>
                </div>
                <div id="main-panel">
                    <Editor content={this.state.currentFilePath ? this.state.openFiles[this.state.currentFilePath] : ''}
                            onUpdate={this.onCurrentFileUpdate.bind(this)}>
                    </Editor>
                </div>
                <div id="right-sidebar">
                </div>
            </div>
            <div id="bottom-bar">
                <StatusBar filePath={this.state.currentFilePath}></StatusBar>
            </div>
        </div>;
    }

    /**
     * This a callback registered on the Editor component as to always have the most up-to-date contents of the current
     * file. It doesn't call 'this.setState' as to not trigger a new render on the Editor component.
     * @param {String} contents - The updated contents of the file
     */
    onCurrentFileUpdate (contents) {
        this.state.openFiles[this.state.currentFilePath] = contents;
    }

    /**
     * The handler of the channel 'editor:file-loaded'.
     * @param {Object} event - The event descriptor
     * @param {Object} payload - A descriptor of the file {filePath, contents}
     */
    onFileLoaded (event, payload) {
        this.state.openFiles[payload.filePath] = payload.contents;
        this.setState({
            currentFilePath: payload.filePath
        });
    }

    /**
     * The handler of the channel 'editor:current-file-request'.
     * @param {Object} event - The event descriptor
     * @param {String} responseChannel - The channel to respond to with the file descriptor
     */
    onCurrentFileRequest (event, responseChannel) {
        event.sender.send(responseChannel, {
            path: this.state.currentFilePath,
            contents: this.state.openFiles[this.state.currentFilePath]
        });
    }

    /**
     * The handler of the channel 'editor:close-file'. If no filePath is specified, the current file being edited is
     * closed.
     * @param {Object} event - The event descriptor
     * @param {String} filePath - The path of the file to be closed
     */
    onCloseFile (event, filePath) {
        if (!filePath)
            filePath = this.state.currentFilePath;

        delete this.state.openFiles[filePath];
        const openFilePaths = Object.keys(this.state.openFiles);
        let nextCurrentFile = null;
        if (openFilePaths.length > 0)
            nextCurrentFile = openFilePaths[0];

        this.setState({ currentFilePath: nextCurrentFile });
    }
};

render(
    <Window></Window>,
    document.getElementById('root')
);
