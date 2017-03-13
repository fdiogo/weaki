import { ipcRenderer } from 'electron';
import React from 'react';
import { render } from 'react-dom';

import Explorer from './components/explorer/explorer';
import Editor from './components/editor/editor';
import StatusBar from './components/status-bar/status-bar';
import FileTree from './file-tree';

/**
 * This React component represents the main window of the application
 * which contains all the other components.
 */
class Window extends React.Component {

    constructor (props) {
        super(props);
        this.state = {
            workspaceFileTree: new FileTree(),
            openedFiles: [],
            currentFile: {
                filePath: null,
                content: null
            }
        };

        /**
         * Channel used when a file has been loaded by the main process.
         *
         * @event application:file-loaded
         * @type {object}
         * @property {string} filePath - The path of the file.
         * @property {string} contents - The contents of the file.
         */
        ipcRenderer.on('application:file-loaded', this.onFileLoaded.bind(this));
        ipcRenderer.on('application:directory-loaded', this.onDirectoryLoaded.bind(this));
        ipcRenderer.on('application:current-file', this.onCurrentFileRequest.bind(this));

        // Commands
        ipcRenderer.on('application:close-file', this.onCloseFile.bind(this));
        ipcRenderer.on('editor:bold', () => this.editor.bold());
        ipcRenderer.on('editor:italic', () => this.editor.italic());
        ipcRenderer.on('editor:strike-through', () => this.editor.strikeThrough());
        ipcRenderer.on('editor:header', (event, level) => this.editor.header(level));
        ipcRenderer.on('editor:link', () => this.editor.link());
        ipcRenderer.on('editor:unordered-list', () => this.editor.unorderedList());
        ipcRenderer.on('editor:ordered-list', () => this.editor.orderedList());
        ipcRenderer.on('editor:blockquote', () => this.editor.blockquote());
        ipcRenderer.on('editor:table', () => this.editor.table());
        ipcRenderer.on('editor:code', () => this.editor.code());
        ipcRenderer.on('editor:horizontal-rule', () => this.editor.horizontalRule());
        ipcRenderer.on('editor:image', () => this.editor.image());
    }

    /**
     * Adds the file to the state and sets it as the current.
     * @param {Object} event - The event descriptor.
     * @param {Object} payload - A descriptor of the file.
     * @param {string} payload.filePath - The path of the file.
     * @param {string} payload.contents - The contents of the file.
     * @listens application:file-loaded
     */
    onFileLoaded (event, payload) {
        this.state.workspaceFileTree.addFile(payload.filePath);
        this.state.openedFiles.push(payload.filePath);
        this.setState({
            currentFile: {
                filePath: payload.filePath,
                content: payload.contents
            }
        });
    }

    /**
     *
     * @param {Object} descriptor - A descriptor of the directory.
     * @param {string} descriptor.directory - The directory.
     * @param {Object[]} descriptor.files - The descriptor of all the files, including the directory itself.
     * @listens application:directory-loaded
     */
    onDirectoryLoaded (event, descriptor) {
        for (let file of descriptor.files) {
            if (file.isDirectory)
                this.state.workspaceFileTree.addDirectory(file.path);
            else
                this.state.workspaceFileTree.addFile(file.path);
        }

        this.setState();
    }

    /**
     * The handler of the channel 'application:current-file'.
     * @param {Object} event - The event descriptor
     * @param {string} responseChannel - The channel to respond to with the file descriptor
     */
    onCurrentFileRequest (event, responseChannel) {
        event.sender.send(responseChannel, {
            path: this.state.currentFile.filePath,
            contents: this.editor.getCurrentText()
        });
    }

    /**
     * The handler of the channel 'editor:close-file'. If no filePath is specified, the current file being edited is
     * closed.
     * @param {Object} event - The event descriptor
     * @param {string} filePath - The path of the file to be closed
     */
    onCloseFile (event, filePath) {
    }

    render () {
        return <div id="viewport">
            <div id="workspace">
                <div id="left-sidebar">
                    <Explorer fileTree={this.state.workspaceFileTree}></Explorer>
                </div>
                <div id="main-panel">
                    <Editor ref={editor => this.editor = editor}
                        openedFiles={this.state.openedFiles}
                        currentFile={this.state.currentFile}>
                    </Editor>
                </div>
                <div id="right-sidebar">
                </div>
            </div>
            <div id="bottom-bar">
                <StatusBar filePath={this.state.currentFile.filePath}></StatusBar>
            </div>
        </div>;
    }
};

render(
    <Window></Window>,
    document.getElementById('root')
);
