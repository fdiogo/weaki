import React from 'react';
import {Editor as DraftEditor, EditorState, Modifier} from 'draft-js';
import MarkdownDecorator from '../../decorators/markdown-decorator';

const PropTypes = {
    content: React.PropTypes.string.isRequired
};

const MAXIMUM_HEADER_LEVEL = 6;
const MINIMUM_HEADER_LEVEL = 1;

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
        this.insertWrapper('~~', '~~');
    }

    /**
     * Creats a link.
     */
    link () {
        if (this.isTextSelected()) {
            const selectedText = this.getSelectedText();
            const linkRegex = new RegExp('^(https?|ftp|file)://[-A-Z0-9+&@#/%?=~_|!:,.;]*[-A-Z0-9+&@#/%=~_|]$', 'i');
            if (linkRegex.test(selectedText))
                this.insertWrapper('[Link Name](', ')');
            else
                this.insertWrapper('[', '](URI)');
        } else
            this.insertWrapper('[Link Name]', '(URI)');
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
     * Selects text in the editor.
     * @param {number} [start=0] - The starting index of the selection.
     * @param {number} [end=content.length] - The ending index of the selection.
     * @deprecated
     */
    selectText (start = 0, end = this.state.content.length) {
        this.textarea.focus();
        this.textarea.setSelectionRange(start, end);
    }

    /**
     * Fetches the editor's current content.
     * @returns {string} The current content.
     * @deprecated
     */
    getCurrentText () {
        return this.state.content;
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
                <span className="editor-button" onClick={this.bold.bind(this)}>
                    <img src="../assets/glyphicons-103-bold.png"/>
                </span>
                <span className="editor-button" onClick={this.italic.bind(this)}>
                    <img src="../assets/glyphicons-102-italic.png"/>
                </span>
                <span className="editor-button" onClick={this.strikeThrough.bind(this)}>
                    <img src="../assets/glyphicons-105-text-strike.png"/>
                </span>
                <span className="editor-button" onClick={this.link.bind(this)}>
                    <img src="../assets/glyphicons-51-link.png"/>
                </span>
                <span className="editor-button" onClick={this.header.bind(this, 1)}>
                    <img src="../assets/glyphicons-460-header.png"/>
                </span>
                <span className="editor-button" onClick={this.unorderedList.bind(this)}>
                    <img src="../assets/glyphicons-115-list.png"/>
                </span>
                <span className="editor-button" onClick={this.orderedList.bind(this)}>
                    <img src="../assets/glyphicons-710-list-numbered.png"/>
                </span>
            </div>
            <div id="editor-content" onClick={() => this.draftEditor.focus()}>
                <DraftEditor ref={editor => this.draftEditor = editor}
                    editorState={this.state.editorState}
                    onChange={this.onChange}/>
            </div>
        </div>;
    }
}

export default Editor;
