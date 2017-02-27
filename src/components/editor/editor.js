import React from 'react';

const PropTypes = {
    content: React.PropTypes.string.isRequired
};

const MAXIMUM_HEADER_LEVEL = 1;
const MINIMUM_HEADER_LEVEL = 6;

/**
 * The React component that represents the application's editor.
 */
class Editor extends React.Component {

    static get propTypes () {
        return PropTypes;
    }

    constructor (props) {
        super(props);
        this.state = {
            content: props.content || ''
        };
    }

    componentWillReceiveProps (nextProps) {
        this.setState(nextProps);
    }

    handleOnChange (event) {
        this.setState({
            content: event.target.value
        });
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
     * @param {number} level - The header level (between 1 and 6).
     */
    header (level) {
        if (level < MAXIMUM_HEADER_LEVEL || level > MINIMUM_HEADER_LEVEL)
            return;

        const headerWrapper = '#'.repeat(level);
        this.insertWrapper(`${headerWrapper} `);
    }

    /**
     * Creates an unordered list.
     */
    unorderedList () {
        this.insertWrapper('  * ');
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
        return this.textarea.selectionStart !== this.textarea.selectionEnd;
    }

    /**
     * Fetches the currently selected text.
     * @returns {string} The currently selected text.
     */
    getSelectedText () {
        if (this.textarea.selectionStart >= this.textarea.selectionEnd)
            return this.state.content.substring(this.textarea.selectionStart, this.textarea.selectionEnd);
        else
            return this.state.content.substring(this.textarea.selectionEnd, this.textarea.selectionStart);
    }

    /**
     * Fetches the editor's current content.
     * @returns {string} The current content.
     */
    getCurrentText () {
        return this.state.content;
    }

    /**
     * Surrounds the currently selected text, if any.
     * @param {string} [prepend=''] - The text to prepend to the selection.
     * @param {string} [append=''] - The text to append to the selection.
     */
    surroundSelection (prepend = '', append = '') {
        if (this.textarea.selectionStart === this.textarea.selectionEnd)
            return;

        const selectionStart = this.textarea.selectionStart;
        const selectionEnd = this.textarea.selectionEnd;
        const start = this.state.content.substring(0, this.textarea.selectionStart);
        const selection = this.state.content.substring(this.textarea.selectionStart, this.textarea.selectionEnd);
        const end = this.state.content.substring(this.textarea.selectionEnd, this.state.content.length);
        const content = start + prepend + selection + append + end;
        this.setState({content: content}, () => {
            this.textarea.setSelectionRange(selectionStart + prepend.length, selectionEnd + prepend.length);
        });
    }

    /**
     * Inserts a markdown wrapper, e.g **text** for bold, at the current carret's position or wraps the currently
     * selected text.
     * @param {string} [prepend=''] - The text to prepend.
     * @param {string} [append=''] - The text to append.
     */
    insertWrapper (prepend = '', append = '') {
        if (!this.isTextSelected()) {
            const caret = this.textarea.selectionEnd;
            this.appendAtCaret(prepend + append, this.setCaretPosition.bind(this, caret + prepend.length));
        } else
            this.surroundSelection(prepend, append);
    }

    /**
     * Moves the caret position with an offset.
     * @param {number} offset - The value to add to the current position.
     */
    moveCaretPosition (offset) {
        this.setCaretPosition(this.textarea.selectionStart + offset);
    }

    /**
     * Sets the position of the caret removing any existing selection.
     * @param {number} position - The new caret's position.
     */
    setCaretPosition (position) {
        this.textarea.focus();
        this.textarea.setSelectionRange(position, position);
    }

    /**
     * Appends text at the current caret's position.
     * @param {string} text - The text to append.
     * @param {action} [callback] - Optional callback invoked as a second parameter to 'setState'.
     *                            [See more.]{@link https://facebook.github.io/react/docs/react-component.html#setstate}
     */
    appendAtCaret (text, callback) {
        const start = this.state.content.substring(0, this.textarea.selectionEnd);
        const end = this.state.content.substring(this.textarea.selectionEnd, this.state.content.length);
        const content = start + text + end;
        this.setState({content: content}, callback);
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
                <span className="editor-button" onClick={this.underline.bind(this)}>
                    <img src="../assets/glyphicons-104-text-underline.png"/>
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
            <textarea
                id="editor-content"
                ref={textarea => this.textarea = textarea}
                value={this.state.content}
                onChange={this.handleOnChange.bind(this)}>
            </textarea>
        </div>;
    }
}

export default Editor;
