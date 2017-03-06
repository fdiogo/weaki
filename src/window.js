import { ipcRenderer } from 'electron';
import React from 'react';
import { render } from 'react-dom';

import Explorer from './components/explorer/explorer';
import Editor from './components/editor/editor';
import StatusBar from './components/status-bar/status-bar';

/**
 * This React component represents the main window of the application
 * which contains all the other components.
 */
class Window extends React.Component {

    constructor (props) {
        super(props);
        this.state = {
            openFiles: {},
            currentFilePath: null
        };

        /**
         * Event fired when a file has been loaded by the main process.
         *
         * @event application:file-loaded
         * @type {object}
         * @property {boolean} isPacked - Indicates whether the snowball is tightly packed.
         */
        ipcRenderer.on('application:file-loaded', this.onFileLoaded.bind(this));
        ipcRenderer.on('application:current-file', this.onCurrentFileRequest.bind(this));

        // Commands
        ipcRenderer.on('application:close-file', this.onCloseFile.bind(this));
        ipcRenderer.on('editor:bold', () => this.editor.bold());
        ipcRenderer.on('editor:italic', () => this.editor.italic());
        ipcRenderer.on('editor:underline', () => this.editor.underline());
        ipcRenderer.on('editor:strike-yhrough', () => this.editor.strikeThrough());
        ipcRenderer.on('editor:link', () => this.editor.link());
        ipcRenderer.on('editor:header', (event, level) => this.editor.header(level));
        ipcRenderer.on('editor:unordered-list', () => this.editor.unorderedList());
        ipcRenderer.on('editor:ordered-list', () => this.editor.orderedList());
    }

    render () {
        return <div id="viewport">
            <div id="workspace">
                <div id="left-sidebar">
                    <Explorer openFiles={Object.keys(this.state.openFiles)}></Explorer>
                </div>
                <div id="main-panel">
                    <Editor ref={editor => this.editor = editor}
                            content={this.state.currentFilePath ? this.state.openFiles[this.state.currentFilePath] : ''}
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
     * The handler of the event 'application:file-loaded'.
     * @param {Object} event - The event descriptor.
     * @param {Object} payload - A descriptor of the file.
     * @param {string} payload.filePath - The path of the file.
     * @param {string} payload.contents - The contents of the file.
     * @listens application:file-loaded
     */
    onFileLoaded (event, payload) {
        this.state.openFiles[payload.filePath] = payload.contents;
        this.setState({
            currentFilePath: payload.filePath
        });
    }

    /**
     * The handler of the channel 'application:current-file'.
     * @param {Object} event - The event descriptor
     * @param {string} responseChannel - The channel to respond to with the file descriptor
     */
    onCurrentFileRequest (event, responseChannel) {
        const currentContent = this.editor.getCurrentText();
        this.state.openFiles[this.state.currentFilePath] = currentContent;

        event.sender.send(responseChannel, {
            path: this.state.currentFilePath,
            contents: currentContent
        });
    }

    /**
     * The handler of the channel 'editor:close-file'. If no filePath is specified, the current file being edited is
     * closed.
     * @param {Object} event - The event descriptor
     * @param {string} filePath - The path of the file to be closed
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
