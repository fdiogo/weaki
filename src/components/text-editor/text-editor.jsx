import React from 'react';
import highlight from 'highlight.js';

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
class TextEditor extends React.Component {

    static getNodeAtCharIndex (rootNode, charIndex) {
        const textNodes = TextEditor.getTextNodes(rootNode);
        let charCount = 0;
        let node;
        for (let textNode of textNodes) {
            charCount += textNode.length;
            if (charCount > charIndex)
                break;
        }

        return node;
    }

    static getTextNodes (rootNode) {
        const nodes = [];
        for (let child of rootNode.childNodes) {
            if (child.nodeType === 3)
                nodes.push(child);
            else
                nodes.push.apply(nodes, TextEditor.getTextNodes(child));
        }

        return nodes;
    }

    static envolveOrphanText (html) {
        let noOrphansOutput = '';
        let open = 0;
        let inTag = false;
        let inOrphan = false;
        for (let i = 0; i < html.length; i++) {
            if (html.charAt(i) === '<') {
                inTag = true;
                if (html.charAt(i + 1) === '/')
                    open--;
                else {
                    if (inOrphan) {
                        noOrphansOutput = noOrphansOutput.concat('</span>');
                        inOrphan = false;
                    }
                    open++;
                }
            } else if (html.charAt(i) === '>')
                inTag = false;
            else if (!inTag && !inOrphan && open === 0) {
                noOrphansOutput = noOrphansOutput.concat('<span>');
                inOrphan = true;
            }

            noOrphansOutput = noOrphansOutput.concat(html.charAt(i));
        }

        if (inOrphan)
            noOrphansOutput = noOrphansOutput.concat('</span>');

        return noOrphansOutput;
    }

    constructor (props) {
        super(props);
        this.state = {
            text: this.props.text,
            html: '<pre><code></code></pre>'
        };

        highlight.configure({
            useBR: false,
            languages: ['markdown']
        });
    }

    componentWillReceiveProps (nextProps) {
        if (nextProps.hasOwnProperty('text')) {
            this.setState({
                text: nextProps.text
            });
        }
    }

    shouldComponentUpdate (nextProps) {
        return nextProps.text !== this.state.text || this.state.html !== this.refs.editable.innerHTML;
    }

    componentDidUpdate (prevProps, prevState) {
        const hljsOutput = highlight.highlightAuto(this.state.text).value;
        const noOrphansOutput = TextEditor.envolveOrphanText(hljsOutput);
        this.refs.editable.innerHTML = `<pre><code>${noOrphansOutput}</code></pre>`;

        if (this.props.onChange && this.state.text !== prevState.text)
            this.props.onChange(this.state.text);
    }

    /**
     * Fetches the editor's current content.
     * @returns {string} The current content.
     */
    getCurrentText () {
        return this.state.text;
    }

    /**
     * Verifies if there's a text selection.
     * @returns {boolean} True if there is a text selection.
     */
    isTextSelected () {
        const selection = this.getSelection();
        return selection.length > 0;
    }

    /**
     * Fetches the currently selected text.
     * @returns {string} The currently selected text.
     */
    getSelectedText () {
        const selection = this.getSelection();

        return this.state.text.substr(selection.start, selection.length);
    }

    getSelection () {
        const selection = window.getSelection();
        const textNodes = TextEditor.getTextNodes(this.refs.editable);

        let selectionStart = 0;
        let selectionLength = 0;
        let i = 0;
        for (; i < textNodes.length && textNodes[i] !== selection.baseNode; i++)
            selectionStart += textNodes[i].length;

        selectionStart += selection.baseOffset;

        for (; i < textNodes.length && textNodes[i] !== selection.focusNode; i++)
            selectionLength += textNodes[i].length;

        if (selection.baseNode !== selection.focusNode)
            selectionLength += selection.focusOffset;

        return {
            start: selectionStart,
            length: selectionLength
        };
    }

    selectText (start = 0, length = this.state.text.length) {
        const textNodes = TextEditor.getTextNodes(this.refs.editable);
        let foundStart = false;
        let charCount = 0;
        let endCharCount, startNode, startOffset, endNode, endOffset;

        for (let textNode of textNodes) {
            endCharCount = charCount + textNode.length;
            if (!foundStart && start >= charCount && (start < endCharCount || (start === endCharCount))) {
                startNode = textNode;
                startOffset = start - charCount;
                foundStart = true;
            }
            if (foundStart && start + length <= endCharCount) {
                endNode = textNode;
                endOffset = start + length - charCount;
                break;
            }
            charCount = endCharCount;
        }

        if (!startNode || !endNode)
            return;

        const range = document.createRange();
        range.selectNodeContents(this.refs.editable);
        range.setStart(startNode, startOffset);
        range.setEnd(endNode, endOffset);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
    }

    /**
     * Inserts a markdown wrapper, e.g **text** for bold, at the current carret's position or wraps the currently
     * selected text.
     * @param {string} [prepend=''] - The text to prepend.
     * @param {string} [append=''] - The text to append.
     */
    wrap (prepend = '', append = '') {
        const selection = this.getSelection();
        const before = this.state.text.substring(0, selection.start);
        const selected = this.state.text.substr(selection.start, selection.length);
        const after = this.state.text.substring(selection.start + selection.length);

        this.setState({
            text: `${before}${prepend}${selected}${append}${after}`
        }, () => this.selectText(before.length + prepend.length, selected.length));
    }

    onInput (event) {
        const selection = this.getSelection();

        this.setState({
            text: this.refs.editable.innerText
        }, () => this.selectText(selection.start, selection.length));
    }

    onKeyDown (event) {
        if (event.keyCode === 13) {
            event.preventDefault();
            event.stopPropagation();
            this.wrap('\n');
            return false;
        }
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
            if (selectedText.includes('/') || LINK_REGEX.test(selectedText))
                this.wrap('[Link Name](', ')');
            else
                this.wrap('[', '](URI)');
        } else
            this.wrap('[Link Name](URI)');
    }

    /**
     * Creats an image.
     */
    image () {
        if (this.isTextSelected()) {
            const selectedText = this.getSelectedText();
            if (selectedText.includes('/') || LINK_REGEX.test(selectedText))
                this.wrap('![Image Name](', ' "Title")');
            else
                this.wrap('![', '](URI "Title")');
        } else
            this.wrap('![Image Name](URI "Title")');
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

    render () {
        return <div ref="editable"
            className="text-editor hljs"
            contentEditable
            dangerouslySetInnerHTML={{__html: this.state.html}}
            onInput={this.onInput.bind(this)}
            onKeyDown={this.onKeyDown.bind(this)}>
        </div>;
    }
}

TextEditor.propTypes = {
    text: React.PropTypes.string.isRequired,
    onChange: React.PropTypes.func.isRequired,
    decorators: React.PropTypes.array
};

TextEditor.defaultProps = {
    text: '',
    decorators: []
};

export default TextEditor;
