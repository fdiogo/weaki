import React from 'react';
import highlight from 'highlight.js';

function getMatches (regex, string) {
    const matches = [];

    if (regex.flags.indexOf('g') === -1) {
        const match = regex.exec(string);
        if (match) matches.push(match);
    } else {
        let match;
        while ((match = regex.exec(string)) !== null)
            matches.push(match);
    }

    return matches;
}

/**
 * @class TextNode
 */
class TextNode {
    constructor (className, start, length) {
        this.class = className;
        this.start = start;
        this.length = length;
        this.children = [];
        this.domNode = null;
    }

    addChild (node) {
        this.children.push(node);
    }

    removeChild (node) {
        const index = this.children.indexOf(node);
        this.children.splice(index, 1);
    }

    /**
     * Compares this node against another. Checks the classes of all the nodes in the tree.
     * Ignores the start index and length of the nodes.
     * This is useful to know when a new update is required to the DOM.
     * @param {TextNode} node - The node to compare against.
     * @returns {boolean} Wether the nodes are identical in decorations.
     */
    compareDecorations (node) {
        if (this.children.length !== node.children.length ||
            this.class !== node.class)
            return false;

        for (let i = 0; i < this.children.length; i++) {
            let thisChild = this.children[i];
            let otherChild = node.children[i];
            if (thisChild.compareDecorations(otherChild) === false)
                return false;
        }

        return true;
    }
}

/**
 * The React component that represents the application's editor.
 */
class TextEditor extends React.Component {

    static findNode (root, start, length) {
        let bestMatch = root;

        while (bestMatch.children.length > 0) {
            const betterNode = bestMatch.children.find(child => {
                return child.start <= start && child.start + child.length >= start + length;
            });

            if (betterNode)
                bestMatch = betterNode;
            else
                break;
        }

        return bestMatch;
    }

    static insertNode (root, className, start, length) {
        const parent = TextEditor.findNode(root, start, length);
        const newNode = new TextNode(className, start, length);

        parent.children
            .filter(child => child.start > start && child.start + child.length < start + length)
            .forEach(child => {
                parent.removeChild(child);
                newNode.addChild(child);
            });

        parent.addChild(newNode);
    }

    static generateHtml (node, text) {
        let html = `<span class="${node.class}">`;
        let index = 0;
        for (let child of node.children) {
            html += text.substr(node.start + index, node.start + child.start);
            html += this.generateHtml(child, text);
            index = child.start + child.length;
        }

        html += `${text.substring(node.start + index, node.start + index + node.length)}</span>`;
        return html;
    }

    constructor (props) {
        super(props);
        this.state = {
            text: this.props.text,
            html: `<pre><code>${this.props.text}</code></pre>`
        };

        highlight.configure({
            useBR: false,
            languages: ['markdown']
        });
    }

    componentWillReceiveProps (nextProps) {
        if (nextProps.hasOwnProperty('text')) {
            this.setState({
                text: nextProps.text,
                tree: this.generateTree(nextProps.text, nextProps.decorators)
            });
        }
    }

    componentDidMount () {
        this.setState({
            tree: this.generateTree()
        });
    }

    componentWillUpdate (nextProps, nextState) {
        const html = TextEditor.generateHtml(nextState.tree, nextState.text);
        nextState.html = `<pre><code>${html}</code></pre>`;
    }

    componentDidUpdate () {
        const editorDOMNode = this.refs.editable;
        const preDOMNode = editorDOMNode.childNodes[0];
        const codeDOMNode = preDOMNode.childNodes[0];
        const rootDOMNode = codeDOMNode.childNodes[0];

        let rootNode = this.state.tree;
        rootNode.domNode = rootDOMNode;
        this.updateDOMReferences(rootNode);
        this.setSelection(this.state.text.length, 0);
    }

    generateTree (text = this.state.text, decorators = this.props.decorators) {
        const root = new TextNode('text-editor-root', 0, text.length);

        for (let decorator of decorators) {
            const matches = getMatches(decorator.regex, text);
            for (let match of matches) {
                const className = decorator.getClass(match);
                const start = match.index;
                const length = match[0].length;
                TextEditor.insertNode(root, className, start, length);
            }
        }

        return root;
    }

    findNode (start = 0, length = 0) {
        return TextEditor.findNode(this.state.tree, start, length);
    }

    insertNode (className, start, length) {
        TextEditor.insertNode(this.state.tree, className, start, length);
        this.forceUpdate();
    }

    updateDOMReferences (root) {
        root.children.forEach((childNode, index) => {
            childNode.domNode = root.domNode.childNodes[index];
            this.updateDOMReferences(childNode);
        });
    }

    onInput (event) {
        const newText = this.refs.editable.innerText;
        this.setState({
            text: newText,
            tree: this.generateTree(newText)
        });
    }

    onKeyDown (event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            this.wrap('\n');
            return false;
        }
    }

    setSelection (start, length) {
        const range = document.createRange();
        const startNode = this.findNode(start);
        const startOffset = start - startNode.start;
        const endNode = this.findNode(start + length);
        const endOffset = start + length - endNode.start;

        range.selectNodeContents(this.refs.editable);
        range.setStart(startNode.domNode, startOffset);
        range.setEnd(endNode.domNode, endOffset);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
    }

    /**
     * Fetches the editor's current content.
     * @returns {string} The current content.
     */
    getCurrentText () {
        return this.state.text;
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
