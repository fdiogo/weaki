import { ipcRenderer, remote } from 'electron';
import React from 'react';
import path from 'path';
import TextEditor from '../text-editor/text-editor';
import Tabs from '../tabs/tabs';

import ImageDecorator from '../../decorators/image-decorator/image-decorator';
import ReferenceDecorator from '../../decorators/reference-decorator/reference-decorator';
import GitCommitSuggester from '../../content-suggesters/git-commit-suggester';
import JavascriptSuggester from '../../content-suggesters/javascript-suggester';

const weaki = remote.getGlobal('instance');

const MAXIMUM_HEADER_LEVEL = 6;
const MINIMUM_HEADER_LEVEL = 1;
const LINK_REGEX = new RegExp('^(https?|ftp|file)://[-A-Z0-9+&@#/%?=~_|!:,.;]*[-A-Z0-9+&@#/%=~_|]$', 'i');
const TABLE_TEMPLATE = `
<table>
    <tr>
        <th> Column Title </th>
    </tr>
    <tr>
        <td> *DATA* </td>
    </tr>
</table>
`;

function File (filePath) {
    this.path = filePath;
    this.watchHandle = null;
    this.lastSavedContent = '';
    this.currentContent = '';
    this.pendingChanges = false;
    this.template = {};
    this.templateVariables = {};
    this.copy = () => {
        const file = new File(filePath);
        for (const propName in this)
            file[propName] = this[propName];
        return file;
    };
}

class Editor extends React.Component {

    constructor (props) {
        super(props);
        const startingFile = new File();

        this.state = {
            openedFiles: [startingFile],
            currentFile: startingFile
        };

        this.suggesters = [new GitCommitSuggester(), new JavascriptSuggester()];
        this.decorators = [ReferenceDecorator, ImageDecorator];

        // Events
        ipcRenderer.on('application:file-loaded', this.onFileLoaded.bind(this));
        ipcRenderer.on('application:save-request', this.onSaveRequest.bind(this));

        // Commands
        ipcRenderer.on('editor:close-file', this.onCloseFile.bind(this));
        ipcRenderer.on('editor:bold', this.bold.bind(this));
        ipcRenderer.on('editor:italic', this.italic.bind(this));
        ipcRenderer.on('editor:strike-through', this.strikeThrough.bind(this));
        ipcRenderer.on('editor:header', (event, level) => this.header(level));
        ipcRenderer.on('editor:link', this.link.bind(this));
        ipcRenderer.on('editor:unordered-list', this.unorderedList.bind(this));
        ipcRenderer.on('editor:ordered-list', this.orderedList.bind(this));
        ipcRenderer.on('editor:blockquote', this.blockquote.bind(this));
        ipcRenderer.on('editor:table', this.table.bind(this));
        ipcRenderer.on('editor:code', this.code.bind(this));
        ipcRenderer.on('editor:horizontal-rule', this.horizontalRule.bind(this));
        ipcRenderer.on('editor:image', this.image.bind(this));
    }

    /**
     * Turns the text bold.
     */
    bold () {
        this.refs.textEditor.insertText('**', '**');
    }

    /**
     * Turns the text italic.
     */
    italic () {
        this.refs.textEditor.insertText('_', '_');
    }

    /**
     * Underlines the text.
     */
    underline () {
        this.refs.textEditor.insertText('__', '__');
    }

    /**
     * Strikes through the text.
     */
    strikeThrough () {
        this.refs.textEditor.insertText('<s>', '</s>');
    }

    /**
     * Creats a link.
     */
    link () {
        if (this.refs.textEditor.isTextSelected()) {
            const selectedText = this.refs.textEditor.getSelectedText();
            if (LINK_REGEX.test(selectedText))
                this.refs.textEditor.insertText('[Link Name](', ')');
            else
                this.refs.textEditor.insertText('[', '](URI)');
        } else
            this.refs.textEditor.insertText('[Link Name]', '(URI)');
    }

    /**
     * Creats an image.
     */
    image () {
        if (this.refs.textEditor.isTextSelected()) {
            const selectedText = this.refs.textEditor.getSelectedText();
            if (LINK_REGEX.test(selectedText))
                this.refs.textEditor.insertText('![Image Name](', ' "Title")');
            else
                this.refs.textEditor.insertText('![', '](URI "Title")');
        } else
            this.refs.textEditor.insertText('![Image Name]', '(URI "Title")');
    }

    /**
     * Creates a header.
     * @param {number} [level=1] - The header level (between 1 and 6).
     */
    header (level = MINIMUM_HEADER_LEVEL) {
        if (level < MINIMUM_HEADER_LEVEL) level = MINIMUM_HEADER_LEVEL;
        else if (level > MAXIMUM_HEADER_LEVEL) level = MAXIMUM_HEADER_LEVEL;

        const headerWrapper = '#'.repeat(level);
        this.refs.textEditor.insertText(`${headerWrapper} `);
    }

    /**
     * Creates an unordered list.
     */
    unorderedList () {
        this.refs.textEditor.insertText('* ');
    }

    /**
     * Creates an ordered list.
     */
    orderedList () {
        this.refs.textEditor.insertText('1. ');
    }

    /**
     * Creates a blockquote.
     */
    blockquote () {
        this.refs.textEditor.insertText('> ');
    }

    /**
     * Creates a span of code.
     */
    code () {
        this.refs.textEditor.insertText('`', '`');
    }

    /**
     * Creates a horizontal rule.
     */
    horizontalRule () {
        this.refs.textEditor.insertText('', '\n***\n');
    }

    table () {
        const tableParts = TABLE_TEMPLATE.split('*DATA*');
        this.refs.textEditor.insertText(tableParts[0], tableParts[1]);
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
     * The handler of the channel 'application:save-request'.
     * @param {Object} event - The event descriptor
     * @param {string} responseChannel - The channel to respond to with the file descriptor
     */
    onSaveRequest (event, responseChannel) {
        const file = this.state.currentFile;
        const path = file.path;
        const content = this.refs.textEditor.getCurrentText();
        ipcRenderer.once(responseChannel, (event, path) => {
            const newFile = file.copy();
            newFile.path = path;
            newFile.pendingChanges = false;
            this.state.openedFiles.splice(this.state.openedFiles.indexOf(file), 1, newFile);
            if (this.state.currentFile === file)
                this.setState({ currentFile: newFile }, this.fireOnChange.bind(this));
        });
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

    applyTemplate (template, variables = {}) {
        if (!template || !template.name || !template.content)
            return;

        const newText = template.content.replace(/{{([^}]+)}}/g, (match, name) => {
            return variables[name] ? variables[name] : match;
        });

        const file = this.state.currentFile;
        file.template = template;
        file.templateVariables = variables;
        file.currentContent = newText;
        file.pendingChanges = true;

        this.setState({ currentFile: file });
    }

    createNewFile () {
        const newFile = new File();
        this.state.openedFiles.push(newFile);
        this.setState({
            openedFiles: this.state.openedFiles,
            currentFile: newFile
        });
    }

    render () {
        return <div className="editor">
            <Tabs data={this.state.openedFiles}
                active={file => file === this.state.currentFile}
                onClick={this.onTabClick.bind(this)}
                getTabDisplay={file => <FileTab {...file}/> }/>
            <TextEditor ref="textEditor"
                text={this.state.currentFile.currentContent}
                onChange={this.onTextChange.bind(this)}
                decorators={this.decorators}
                suggesters={this.suggesters}
                disabled={this.state.openedFiles.length === 0}/>
        </div>;
    }
}

class FileTab extends React.Component {

    render () {
        const name = this.props.path ? path.basename(this.props.path) : 'untitled';

        return <span className="editor-tab">
            <span className="editor-tab-name">{name}</span>
            { this.props.pendingChanges ? <span className="octicon-white octicon-primitive-dot"></span> : null }
        </span>;
    }
}

export default Editor;
