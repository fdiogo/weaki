import React from 'react';
import keycode from 'keycode';
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

class TextNode {
    constructor (className, start, length) {
        this.class = className;
        this.start = start;
        this.length = length;
        this.children = [];
    }

    addChild (node) {
        this.children.push(node);
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

    constructor (props) {
        super(props);
        this.state = {
            text: this.props.text,
            html: this.props.text
        };

        highlight.configure({
            useBR: false,
            languages: ['markdown']
        });
    }

    componentDidMount () {
        this.setState({
            tree: this.generateTree()
        });
    }

    componentWillUpdate (nextProps, nextState) {
        const html = this.generateHtml(nextState.tree);
        nextState.html = `<pre><code>${html}</code></pre>`;
    }

    generateTree () {
        const root = new TextNode('text-editor-root', 0, this.state.text.length);

        for (let decorator of this.props.decorators) {
            const matches = getMatches(decorator.regex, this.state.text);
            for (let match of matches) {
                const parent = TextEditor.findNode(root, match.index, match[0].length);
                const className = decorator.getClass(match);
                const newNode = new TextNode(className, match.index, match[0].length);
                parent.addChild(newNode);
            }
        }

        return root;
    }

    generateHtml (node) {
        let html = `<span class="${node.class}">`;
        let index = 0;
        for (let child of node.children) {
            html += this.state.text.substr(index, child.start);
            html += this.generateHtml(child);
            index = child.start + child.length;
        }

        html += `${this.state.text.substring(index, node.start + node.length)}</span>`;
        return html;
    }

    findNode (start = 0, length = this.state.text.length) {
        return TextEditor.findNode(this.state.tree, start, length);
    }

    onInput (event) {
        // const selection = this.getSelection();
        //
        // this.setState({
        //     text: this.refs.editable.innerText
        // }, () => this.selectText(selection.start, selection.length));
    }

    onKeyDown (event) {
        if (event.keyCode === keycode('enter')) {
            event.preventDefault();
            this.wrap('\n');
            return false;
        }
    }

    componentWillReceiveProps (nextProps) {
        if (nextProps.hasOwnProperty('text')) {
            this.setState({
                text: nextProps.text
            });
        }
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
