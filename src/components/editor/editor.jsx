import { ipcRenderer, remote } from 'electron';
import React from 'react';
import path from 'path';
import TextEditor from '../text-editor/text-editor';
import Tabs from '../tabs/tabs';

import ImageDecorator from '../../decorators/image-decorator/image-decorator';
import ReferenceDecorator from '../../decorators/reference-decorator/reference-decorator';
import GitCommitSuggestor from '../../content-suggestors/git-commit-suggestor';
import JavascriptSuggestor from '../../content-suggestors/javascript-suggestor';

const weaki = remote.getGlobal('instance');

function File (filePath) {
    this.path = filePath;
    this.watchHandle = null;
    this.lastSavedContent = '';
    this.currentContent = '';
    this.pendingChanges = false;
}

class Editor extends React.Component {

    constructor (props) {
        super(props);
        this.state = {
            openedFiles: [],
            currentFile: new File()
        };

        this.suggestors = [new GitCommitSuggestor(), new JavascriptSuggestor()];
        this.decorators = [ReferenceDecorator, ImageDecorator];

        // Events
        ipcRenderer.on('application:file-loaded', this.onFileLoaded.bind(this));
        ipcRenderer.on('application:current-file', this.onCurrentFile.bind(this));

        // Commands
        ipcRenderer.on('editor:close-file', this.onCloseFile.bind(this));
        ipcRenderer.on('editor:bold', () => this.refs.textEditor.bold());
        ipcRenderer.on('editor:italic', () => this.refs.textEditor.italic());
        ipcRenderer.on('editor:strike-through', () => this.refs.textEditor.strikeThrough());
        ipcRenderer.on('editor:header', (event, level) => this.refs.textEditor.header(level));
        ipcRenderer.on('editor:link', () => this.refs.textEditor.link());
        ipcRenderer.on('editor:unordered-list', () => this.refs.textEditor.unorderedList());
        ipcRenderer.on('editor:ordered-list', () => this.refs.textEditor.orderedList());
        ipcRenderer.on('editor:blockquote', () => this.refs.textEditor.blockquote());
        ipcRenderer.on('editor:table', () => this.refs.textEditor.table());
        ipcRenderer.on('editor:code', () => this.refs.textEditor.code());
        ipcRenderer.on('editor:horizontal-rule', () => this.refs.textEditor.horizontalRule());
        ipcRenderer.on('editor:image', () => this.refs.textEditor.image());
    }

    /**
     * Adds the file to the state and sets it as the current.
     * @param {Object} event - The event descriptor.
     * @param {string} filePath - The path of the file.
     * @param {string} content - The content of the file.
     * @listens application:file-loaded
     */
    onFileLoaded (event, filePath, content) {
        let file = this.state.openedFiles.find(file => file.path === filePath);
        if (file)
            weaki.fileManager.unwatchFileChange(filePath, this.state.currentFile.watchHandle);
        else {
            file = new File(filePath);
            this.state.openedFiles.push(file);
        }

        file.watchHandle = weaki.fileManager.watchFileChange(filePath, this.onFileModified.bind(this));
        file.lastSavedContent = file.currentContent = content;
        file.pendingChanges = false;

        this.setState({ currentFile: file }, this.fireOnChange.bind(this));
    }

    /**
     * @listens application:file-changed
     */
    onFileModified (filePath, isExternal) {
        if (filePath !== this.state.currentFile.path)
            return;

        this.state.currentFile.pendingChanges = false;
        if (isExternal) {
            weaki.fileManager.readFile(filePath)
                .then(content => {
                    // This check is here because during the read operation the user
                    // could have changed files.
                    if (this.state.currentFile.path === filePath) {
                        this.state.currentFile.currentContent = content;
                        this.state.currentFile.lastSavedContent = content;
                        this.forceUpdate(this.fireOnChange.bind(this));
                    }
                });
        } else {
            this.state.currentFile.lastSavedContent = this.state.currentFile.currentContent;
            this.forceUpdate(this.fireOnChange.bind(this));
        }
    }

    /**
     * The handler of the channel 'application:current-file'.
     * @param {Object} event - The event descriptor
     * @param {string} responseChannel - The channel to respond to with the file descriptor
     */
    onCurrentFile (event, responseChannel) {
        const path = this.state.currentFile.path;
        const content = this.refs.textEditor.getCurrentText();
        event.sender.send(responseChannel, path, content);
    }

    onCloseFile (event, filePath) {
        let index = -1;
        if (filePath)
            index = this.state.openedFiles.findIndex(file => file.path === filePath);
        else
            index = this.state.openedFiles.indexOf(this.state.currentFile);

        if (index === -1)
            return;

        const fileToRemove = this.state.openedFiles[index];
        this.state.openedFiles.splice(index, 1);

        if (fileToRemove === this.state.currentFile) {
            const openedFiles = this.state.openedFiles;
            this.state.currentFile = openedFiles.length > 0 ? openedFiles[0] : new File();
            this.forceUpdate(this.fireOnChange.bind(this));
        } else
            this.forceUpdate();
    }

    onTabClick (file) {
        if (file !== this.state.currentFile)
            this.setState({ currentFile: file }, this.fireOnChange.bind(this));
    }

    fireOnChange () {
        if (this.props.onChange)
            this.props.onChange(this.state.currentFile);
    }

    onTextChange (text) {
        const currentFile = this.state.currentFile;
        currentFile.currentContent = text;

        if (currentFile.currentContent !== currentFile.lastSavedContent)
            currentFile.pendingChanges = true;
        else
            currentFile.pendingChanges = false;

        this.setState({ openedFiles: this.state.openedFiles }, this.fireOnChange.bind(this));
    }

    render () {
        return <div className="editor">
            <Tabs data={this.state.openedFiles}
                active={file => file.path === this.state.currentFile.path}
                onClick={this.onTabClick.bind(this)}
                getTabDisplay={file => <FileTab {...file}/> }/>
            <TextEditor ref="textEditor"
                text={this.state.currentFile.currentContent}
                onChange={this.onTextChange.bind(this)}
                decorators={this.decorators}
                suggestors={this.suggestors}/>
        </div>;
    }
}

class FileTab extends React.Component {
    render () {
        return <span className="editor-tab">
            <span className="editor-tab-name">{path.basename(this.props.path)}</span>
            { this.props.pendingChanges ? <span className="octicon-white octicon-primitive-dot"></span> : null }
        </span>;
    }
}

export default Editor;
