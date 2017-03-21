import { ipcRenderer, remote } from 'electron';
import React from 'react';
import { render } from 'react-dom';
import { Router, Route } from 'react-router-dom';
import History from 'history/createMemoryHistory';

import ReactMarkdown from 'react-markdown';
import Explorer from './components/explorer/explorer';
import Editor from './components/editor/editor';
import FileHistory from './components/file-history/file-history';
import StatusBar from './components/status-bar/status-bar';
import GitCommit from './components/git-commit/git-commit';
import FileTree from './file-tree';

const weaki = remote.getGlobal('instance');

/**
 * This React component represents the main window of the application
 * which contains all the other components.
 */
class Window extends React.Component {

    constructor (props) {
        super(props);
        this.state = {
            workspaceFileTree: new FileTree(),
            currentFile: {
                path: '',
                watchHandle: null,
                lastSavedContent: null
            },
            rightSidebarHistory: History({
                initialEntries: ['/history'],
                initialIndex: 0,
                getUserConfirmation: null
            })
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
        ipcRenderer.on('application:open-on-right-sidebar', this.onOpenOnRightSidebar.bind(this));

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
     * @param {string} filePath - The path of the file.
     * @param {string} content - The content of the file.
     * @listens application:file-loaded
     */
    onFileLoaded (event, filePath, content) {
        this.editor.replaceText(content);
        weaki.fileManager.unwatchFileChange(filePath, this.state.currentFile.watchHandle);
        const watchHandle = weaki.fileManager.watchFileChange(filePath, this.onFileChanged.bind(this));

        this.state.workspaceFileTree.addFile(filePath);
        this.state.currentFile = {
            path: filePath,
            watchHandle: watchHandle,
            lastSavedContent: content
        };

        this.forceUpdate();
    }

    /**
     *
     */
    onDirectoryLoaded (event, directory, files) {
        this.state.workspaceFileTree.addDirectory(directory);
        for (let file of files) {
            if (file.isDirectory)
                this.state.workspaceFileTree.addDirectory(file.path);
            else
                this.state.workspaceFileTree.addFile(file.path);
        }

        this.forceUpdate();
    }

    /**
     * The handler of the channel 'application:current-file'.
     * @param {Object} event - The event descriptor
     * @param {string} responseChannel - The channel to respond to with the file descriptor
     */
    onCurrentFileRequest (event, responseChannel) {
        const path = this.state.currentFile.path;
        const content = this.editor.getCurrentText();
        event.sender.send(responseChannel, path, content);
    }

    /**
     * @listens application:file-changed
     */
    onFileChanged (filePath, isExternal) {
        if (filePath !== this.state.currentFile.path)
            return;

        if (isExternal) {
            weaki.fileManager.readFile(filePath)
                .then(content => {
                    // This check is here because during the read operation the user
                    // could have changed files.
                    if (this.state.currentFile.path === filePath) {
                        this.editor.replaceText(content);
                        this.state.currentFile.lastSavedContent = content;
                        this.forceUpdate();
                    }
                });
        } else {
            this.state.currentFile.lastSavedContent = this.editor.getCurrentText();
            this.forceUpdate();
        }
    }

    /**
     * Opens a component, via its route, on the right sidebar.
     * @param {string} route - The route of the component.
     */
    onOpenOnRightSidebar (event, route) {
        this.state.rightSidebarHistory.push(route);
        this.forceUpdate();
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
                    <Editor ref={editor => this.editor = editor}/>
                </div>
                <Router history={this.state.rightSidebarHistory}>
                    <div id="right-sidebar">
                        <Route path='/history' render={() =>
                            <FileHistory filePath={this.state.currentFile.path}></FileHistory>
                        }/>
                        <Route path='/git/commit' render={() => <GitCommit></GitCommit>}/>
                        <Route path='/preview' render={() =>
                            <ReactMarkdown source={this.state.currentFile.lastSavedContent}></ReactMarkdown>
                        }/>
                    </div>
                </Router>
            </div>
            <div id="bottom-bar">
                <StatusBar filePath={this.state.currentFile.path}></StatusBar>
            </div>
        </div>;
    }
};

render(
    <Window></Window>,
    document.getElementById('root')
);
