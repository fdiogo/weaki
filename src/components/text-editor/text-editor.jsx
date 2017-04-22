import React from 'react';
import Delta from 'quill-delta';
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
 * The React component that represents the application's editor.
 */
class TextEditor extends React.Component {

    constructor (props) {
        super(props);
        this.state = {
            text: this.props.text,
            selection: {
                start: 0,
                end: 0
            },
            html: ''
        };

        highlight.configure({
            useBR: false,
            languages: ['markdown']
        });
    }

    componentDidMount () {
        this.forceUpdate();
    }

    componentWillUpdate (nextProps, nextState) {
        const selection = nextState.selection;
        const reverse = selection.start > selection.end;

        let delta = new Delta().insert(nextState.text);
        let cursorDelta = new Delta().retain(selection.end).insert({ cursor: '' }, { 'blinking-cursor': true });
        let selectionDelta;
        if (reverse) {
            selectionDelta = new Delta().retain(selection.end)
                                        .retain(selection.start - selection.end, { selected: true });
        } else {
            selectionDelta = new Delta().retain(selection.start)
                                        .retain(selection.end - selection.start, { selected: true });
        }

        const matches = getMatches(/\[.*\]/ig, nextState.text);
        for (let match of matches) {
            const decoratorDelta = new Delta().retain(match.index).retain(match[0].length, { reference: true });
            delta = delta.compose(decoratorDelta);
        }

        delta = delta.compose(selectionDelta);
        delta = delta.compose(cursorDelta);

        let html = '';
        for (let op of delta.ops) {
            const classes = Object.keys(op.attributes || {});
            let text = op.insert;
            if (op.insert.hasOwnProperty('cursor'))
                text = op.insert.cursor;
            html += `<span class="${classes.join(' ')}">${text}</span>`;
        }

        nextState.html = html;
    }

    componentWillReceiveProps (nextProps) {
        if (nextProps.hasOwnProperty('text')) {
            this.setState({
                text: nextProps.text
            });
        }
    }

    onKeyPress (event) {
        this.insertText(String.fromCodePoint(event.which));
    }

    onKeyDown (event) {
        switch (event.key) {
            case 'Enter':
                event.preventDefault();
                this.insertText('\n');
                break;
            case 'Backspace':
                this.deleteText();
                break;
            case 'ArrowRight':
                if (event.shiftKey) this.moveSelection(+1);
                else this.moveCaret(+1);
                break;
            case 'ArrowLeft':
                if (event.shiftKey) this.moveSelection(-1);
                else this.moveCaret(-1);
                break;
            case 'ArrowUp':
                event.preventDefault();
                if (event.shiftKey) this.moveSelection(0, -1);
                else this.moveCaret(0, -1);
                break;
            case 'ArrowDown':
                event.preventDefault();
                if (event.shiftKey) this.moveSelection(0, +1);
                else this.moveCaret(0, +1);
                break;
            case 'End':
                if (event.shiftKey) this.moveSelectionToLineEnd();
                else this.moveToLineEnd();
                break;
            case 'Home':
                if (event.shiftKey) this.moveSelectionToLineStart();
                else this.moveToLineStart();
                break;
        }
    }

    /**
     * Fetches the editor's current content.
     * @returns {string} The current content.
     */
    getCurrentText () {
        return this.state.lines.join('\n');
    }

    getSelection () {
        return this.state.selection;
    }

    moveSelection (xOffset = 0, yOffset = 0) {
        const index = this.getIndexFromOffset(xOffset, yOffset);
        this.setState({
            selection: {
                start: this.state.selection.start,
                end: index
            }
        });
    }

    moveCaret (xOffset = 0, yOffset = 0) {
        const index = this.getIndexFromOffset(xOffset, yOffset);
        this.setState({
            selection: {
                start: index,
                end: index
            }
        });
    }

    getIndexFromOffset (xOffset = 0, yOffset = 0) {
        const selection = this.state.selection;
        let index = 0;
        if (yOffset === 0)
            index = Math.max(0, Math.min(this.state.text.length, selection.end + xOffset));
        else {
            const lines = this.state.text.split('\n');

            let y = 0;
            while (y < lines.length && index + lines[y].length + 1 <= selection.end) {
                index += lines[y].length + 1;
                y += 1;
            }

            const x = selection.end - index;
            const wantedY = Math.max(0, Math.min(lines.length - 1, y + yOffset));
            const sign = Math.sign(yOffset);
            if (sign > 0) {
                while (y < wantedY) {
                    index += lines[y].length + 1;
                    y += 1;
                }
            } else {
                while (y > wantedY) {
                    y -= 1;
                    index -= lines[y].length + 1;
                }
            }

            index += Math.max(0, Math.min(lines[y].length, x));
        }

        return index;
    }

    getCurrentLineStartIndex () {
        const selection = this.state.selection;
        const index = this.state.text.substring(0, selection.end).lastIndexOf('\n');
        let newOffset;
        if (index === -1)
            newOffset = 0;
        else
            newOffset = index + 1;

        return newOffset;
    }

    getCurrentLineEndIndex () {
        const selection = this.state.selection;
        const index = this.state.text.substring(selection.end).indexOf('\n');
        let newOffset;
        if (index === -1)
            newOffset = this.state.text.length;
        else
            newOffset = selection.end + index;

        return newOffset;
    }

    moveToLineEnd () {
        const index = this.getCurrentLineEndIndex();

        this.setState({
            selection: {
                start: index,
                end: index
            }
        });
    }

    moveToLineStart () {
        const index = this.getCurrentLineStartIndex();

        this.setState({
            selection: {
                start: index,
                end: index
            }
        });
    }

    moveSelectionToLineEnd () {
        const index = this.getCurrentLineEndIndex();

        this.setState({
            selection: {
                start: this.state.selection.start,
                end: index
            }
        });
    }

    moveSelectionToLineStart () {
        const index = this.getCurrentLineStartIndex();

        this.setState({
            selection: {
                start: this.state.selection.start,
                end: index
            }
        });
    }

    insertText (prepend = '', append = '') {
        const selection = this.getSelection();
        const before = this.state.text.substring(0, selection.start);
        const selected = this.state.text.substring(selection.start, selection.end);
        const after = this.state.text.substring(selection.end);

        const alteredText = `${before}${prepend}${selected}${append}${after}`;
        this.setState({
            text: alteredText,
            selection: {
                start: selection.start + prepend.length,
                end: selection.end + prepend.length
            }
        });
    }

    deleteText () {
        const selection = this.state.selection;
        const collapsed = selection.start === selection.end;
        const reversed = selection.start > selection.end;

        let before, after;
        if (collapsed && this.state.text.length > 0) {
            before = this.state.text.substring(0, selection.start - 1);
            after = this.state.text.substring(selection.end);
        } else {
            before = this.state.text.substring(0, reversed ? selection.end : selection.start);
            after = this.state.text.substring(reversed ? selection.start : selection.end);
        }

        let newIndex;
        if (collapsed)
            newIndex = Math.max(0, selection.end - 1);
        else if (reversed)
            newIndex = selection.end;
        else
            newIndex = selection.start;

        this.setState({
            text: before + after,
            selection: {
                start: newIndex,
                end: newIndex
            }
        });
    }

    render () {
        return <div className="text-editor hljs"
            tabIndex="0"
            onKeyPress={this.onKeyPress.bind(this)}
            onKeyDown={this.onKeyDown.bind(this)}>
            <pre>
                <code dangerouslySetInnerHTML={{__html: this.state.html}}>
                </code>
            </pre>
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
