import React from 'react';
import {Editor as DraftEditor, EditorState, Modifier} from 'draft-js';
import MarkdownDecorator from '../../decorators/markdown-decorator';

const PropTypes = {
    openedFiles: React.PropTypes.array,
    currentFile: React.PropTypes.shape({
        filePath: React.PropTypes.string,
        content: React.PropTypes.string
    })
};

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

/**
 * The React component that represents the application's editor.
 */
class Editor extends React.Component {

    static get propTypes () {
        return PropTypes;
    }

    constructor (props) {
        super(props);
        const decorator = new MarkdownDecorator();
        this.state = {editorState: EditorState.createEmpty(decorator)};
        this.onChange = (editorState) => this.setState({editorState});
    }

    /**
     * Turns the text bold.
     */
    bold () {
        this.insertWrapper('**', '**');
    }

    /**
     * Turns the text italic.
     */
    italic () {
        this.insertWrapper('_', '_');
    }

    /**
     * Underlines the text.
     */
    underline () {
        this.insertWrapper('__', '__');
    }

    /**
     * Strikes through the text.
     */
    strikeThrough () {
        this.insertWrapper('<s>', '</s>');
    }

    /**
     * Creats a link.
     */
    link () {
        if (this.isTextSelected()) {
            const selectedText = this.getSelectedText();
            if (LINK_REGEX.test(selectedText))
                this.insertWrapper('[Link Name](', ')');
            else
                this.insertWrapper('[', '](URI)');
        } else
            this.insertWrapper('[Link Name]', '(URI)');
    }

    /**
     * Creats an image.
     */
    image () {
        if (this.isTextSelected()) {
            const selectedText = this.getSelectedText();
            if (LINK_REGEX.test(selectedText))
                this.insertWrapper('![Image Name](', ' "Title")');
            else
                this.insertWrapper('![', '](URI "Title")');
        } else
            this.insertWrapper('![Image Name]', '(URI "Title")');
    }

    /**
     * Creates a header.
     * @param {number} [level=1] - The header level (between 1 and 6).
     */
    header (level = MINIMUM_HEADER_LEVEL) {
        if (level < MINIMUM_HEADER_LEVEL) level = MINIMUM_HEADER_LEVEL;
        else if (level > MAXIMUM_HEADER_LEVEL) level = MAXIMUM_HEADER_LEVEL;

        const headerWrapper = '#'.repeat(level);
        this.insertWrapper(`${headerWrapper} `);
    }

    /**
     * Creates an unordered list.
     */
    unorderedList () {
        this.insertWrapper('* ');
    }

    /**
     * Creates an ordered list.
     */
    orderedList () {
        this.insertWrapper('1. ');
    }

    /**
     * Creates a blockquote.
     */
    blockquote () {
        this.insertWrapper('> ');
    }

    /**
     * Creates a span of code.
     */
    code () {
        this.insertWrapper('`', '`');
    }

    /**
     * Creates a horizontal rule.
     */
    horizontalRule () {
        this.insertWrapper('', '\n***\n');
    }

    table () {
        const tableParts = TABLE_TEMPLATE.split('*DATA*');
        this.insertWrapper(tableParts[0], tableParts[1]);
    }

    /**
     * Verifies if there's a text selection.
     * @returns {boolean} True if there is a text selection.
     */
    isTextSelected () {
        const selection = this.state.editorState.getSelection();
        return !selection.isCollapsed();
    }

    /**
     * Fetches the currently selected text.
     * @returns {string} The currently selected text.
     */
    getSelectedText () {
        const selection = this.state.editorState.getSelection();

        if (selection.isCollapsed())
            return '';

        const content = this.state.editorState.getCurrentContent();
        const anchorKey = selection.getAnchorKey();
        const currentContentBlock = content.getBlockForKey(anchorKey);
        const start = selection.getStartOffset();
        const end = selection.getEndOffset();
        return currentContentBlock.getText().slice(start, end);
    }

    /**
     * Fetches the editor's current content.
     * @returns {string} The current content.
     */
    getCurrentText () {
        const content = this.state.editorState.getCurrentContent();
        return content.getPlainText();
    }

    selectText () {
        const content = this.state.editorState.getCurrentContent();
        const selection = this.state.editorState.getSelection();
        const firstBlock = content.getFirstBlock();
        const lastBlock = content.getLastBlock();
        const allTextSelection = selection.merge({
            anchorKey: firstBlock.getKey(),
            anchorOffset: 0,
            focusKey: lastBlock.getKey(),
            focusOffset: lastBlock.getLength(),
            hasFocus: true
        });

        const newState = EditorState.forceSelection(this.state.editorState, allTextSelection);
        this.setState({ editorState: newState });
    }

    replaceText (newText) {
        const content = this.state.editorState.getCurrentContent();
        const selection = this.state.editorState.getSelection();
        const firstBlock = content.getFirstBlock();
        const lastBlock = content.getLastBlock();
        const allTextSelection = selection.merge({
            anchorKey: firstBlock.getKey(),
            anchorOffset: 0,
            focusKey: lastBlock.getKey(),
            focusOffset: lastBlock.getLength(),
            hasFocus: true
        });

        const newContent = Modifier.replaceText(content, allTextSelection, newText);
        const newState = EditorState.push(this.state.editorState, newContent, 'replace-text');
        this.setState({ editorState: newState });
    }

    /**
     * Inserts a markdown wrapper, e.g **text** for bold, at the current carret's position or wraps the currently
     * selected text.
     * @param {string} [prepend=''] - The text to prepend.
     * @param {string} [append=''] - The text to append.
     */
    insertWrapper (prepend = '', append = '') {
        const content = this.state.editorState.getCurrentContent();
        const selection = this.state.editorState.getSelection();

        let newContent;
        if (selection.isCollapsed())
            newContent = Modifier.insertText(content, selection, `${prepend}${append}`);
        else {
            const selectedText = this.getSelectedText();
            newContent = Modifier.replaceText(content, selection, `${prepend}${selectedText}${append}`);
        }

        const afterInsertState = EditorState.push(this.state.editorState, newContent, 'insert-characters');
        const withSelectionState = EditorState.forceSelection(afterInsertState, selection.merge({
            anchorKey: selection.anchorKey,
            anchorOffset: selection.anchorOffset + prepend.length,
            focusKey: selection.focusKey,
            focusOffset: selection.focusOffset + prepend.length
        }));
        this.setState({ editorState: withSelectionState });
    }

    render () {
        return <div id="editor">
            <div id="editor-buttons">
                <span className="editor-button-group">
                    <span className="editor-button" onClick={this.header.bind(this, 1)}>
                        <b>h1</b>
                    </span>
                    <span className="editor-button" onClick={this.header.bind(this, 2)}>
                        <b>h2</b>
                    </span>
                    <span className="editor-button" onClick={this.header.bind(this, 3)}>
                        <b>h3</b>
                    </span>
                </span>
                <span className="editor-button-group">
                    <span className="editor-button" onClick={this.link.bind(this)}>
                        <span className="octicon octicon-link"></span>
                    </span>
                    <span className="editor-button" onClick={this.image.bind(this)}>
                        <span className="octicon octicon-file-media"></span>
                    </span>
                </span>
                <span className="editor-button-group">
                    <span className="editor-button" onClick={this.bold.bind(this)}>
                        <span className="octicon octicon-bold"></span>
                    </span>
                    <span className="editor-button" onClick={this.italic.bind(this)}>
                        <span className="octicon octicon-italic"></span>
                    </span>
                    <span className="editor-button" onClick={this.code.bind(this)}>
                        <span className="octicon octicon-code"></span>
                    </span>
                </span>
                <span className="editor-button-group">
                    <span className="editor-button" onClick={this.unorderedList.bind(this)}>
                        <span className="octicon octicon-list-unordered"></span>
                    </span>
                    <span className="editor-button" onClick={this.orderedList.bind(this)}>
                        <span className="octicon octicon-list-ordered"></span>
                    </span>
                    <span className="editor-button" onClick={this.blockquote.bind(this)}>
                        <span className="octicon octicon-quote"></span>
                    </span>
                    <span className="editor-button" onClick={this.horizontalRule.bind(this)}>
                        <span className="octicon octicon-horizontal-rule"></span>
                    </span>
                </span>
                <span className="editor-button-group">
                    <span className="editor-button" onClick={this.strikeThrough.bind(this)}>
                        <span className="glyphicon glyphicon-text-strike"></span>
                    </span>
                    <span className="editor-button" onClick={this.table.bind(this)}>
                        <span className="glyphicon glyphicon-table"></span>
                    </span>
                </span>
            </div>
            <div id="editor-content" onClick={() => this.draftEditor.focus()}>
                <DraftEditor ref={editor => this.draftEditor = editor}
                    editorState={this.state.editorState}
                    onChange={this.onChange.bind(this)}/>
            </div>
        </div>;
    }
}

export default Editor;
