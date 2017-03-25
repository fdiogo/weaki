import React from 'react';
import Quill from 'quill';
import highlight from 'highlight.js';

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
        highlight.configure({
            useBR: false,
            languages: ['markdown']
        });
    }

    componentDidMount () {
        this.quill = new Quill(this.refs.content, {
            theme: 'bubble',
            modules: {
                toolbar: false,
                syntax: {
                    highlight: text => highlight.highlightAuto(text).value
                }
            }
        });
        this.quill.format('code-block', true);
        this.replaceText(this.props.content || '');
    }

    componentWillReceiveProps (nextProps) {
        if (nextProps.content)
            this.replaceText(nextProps.content);
    }

    /**
     * Turns the text bold.
     */
    bold () {
        this.wrap('**', '**');
    }

    /**
     * Turns the text italic.
     */
    italic () {
        this.wrap('_', '_');
    }

    /**
     * Underlines the text.
     */
    underline () {
        this.wrap('__', '__');
    }

    /**
     * Strikes through the text.
     */
    strikeThrough () {
        this.wrap('<s>', '</s>');
    }

    /**
     * Creats a link.
     */
    link () {
        if (this.isTextSelected()) {
            const selectedText = this.getSelectedText();
            if (LINK_REGEX.test(selectedText))
                this.wrap('[Link Name](', ')');
            else
                this.wrap('[', '](URI)');
        } else
            this.wrap('[Link Name]', '(URI)');
    }

    /**
     * Creats an image.
     */
    image () {
        if (this.isTextSelected()) {
            const selectedText = this.getSelectedText();
            if (LINK_REGEX.test(selectedText))
                this.wrap('![Image Name](', ' "Title")');
            else
                this.wrap('![', '](URI "Title")');
        } else
            this.wrap('![Image Name]', '(URI "Title")');
    }

    /**
     * Creates a header.
     * @param {number} [level=1] - The header level (between 1 and 6).
     */
    header (level = MINIMUM_HEADER_LEVEL) {
        if (level < MINIMUM_HEADER_LEVEL) level = MINIMUM_HEADER_LEVEL;
        else if (level > MAXIMUM_HEADER_LEVEL) level = MAXIMUM_HEADER_LEVEL;

        const headerWrapper = '#'.repeat(level);
        this.wrap(`${headerWrapper} `);
    }

    /**
     * Creates an unordered list.
     */
    unorderedList () {
        this.wrap('* ');
    }

    /**
     * Creates an ordered list.
     */
    orderedList () {
        this.wrap('1. ');
    }

    /**
     * Creates a blockquote.
     */
    blockquote () {
        this.wrap('> ');
    }

    /**
     * Creates a span of code.
     */
    code () {
        this.wrap('`', '`');
    }

    /**
     * Creates a horizontal rule.
     */
    horizontalRule () {
        this.wrap('', '\n***\n');
    }

    table () {
        const tableParts = TABLE_TEMPLATE.split('*DATA*');
        this.wrap(tableParts[0], tableParts[1]);
    }

    /**
     * Verifies if there's a text selection.
     * @returns {boolean} True if there is a text selection.
     */
    isTextSelected () {
        const selection = this.quill.getSelection();
        return selection.range !== 0;
    }

    /**
     * Fetches the currently selected text.
     * @returns {string} The currently selected text.
     */
    getSelectedText () {
        const selection = this.quill.getSelection();

        if (selection.length === 0)
            return '';

        return this.quill.getText(selection.index, selection.length);
    }

    /**
     * Fetches the editor's current content.
     * @returns {string} The current content.
     */
    getCurrentText () {
        return this.quill.getText();
    }

    selectText () {
        this.quill.setSelection(0, this.quill.getLength());
    }

    replaceText (newText) {
        this.quill.setText(newText);
        this.quill.formatText(0, newText.length, 'code-block', true);
    }

    /**
     * Inserts a markdown wrapper, e.g **text** for bold, at the current carret's position or wraps the currently
     * selected text.
     * @param {string} [prepend=''] - The text to prepend.
     * @param {string} [append=''] - The text to append.
     */
    wrap (prepend = '', append = '') {
        const selection = this.quill.getSelection();
        if (selection.length === 0) {
            this.quill.insertText(selection.index, `${prepend}${append}`);
            this.quill.setSelection(selection.index + prepend.length, 0);
        } else {
            this.quill.insertText(selection.index, prepend);
            this.quill.insertText(selection.index + prepend.length + selection.length, append);
            this.quill.setSelection(selection.index + prepend.length, selection.length);
        }
    }

    render () {
        return <div className="editor">
            {/* <div className="editor-buttons">
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
            </div> */}
            <div ref="content" className="editor-content">
            </div>
        </div>;
    }
}

export default Editor;
