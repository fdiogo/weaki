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

function getAccelerator (event) {
    let accelerator = '';
    if (event.ctrlKey)
        accelerator += 'Ctrl+';
    if (event.shiftKey)
        accelerator += 'Shift+';
    if (event.altKey)
        accelerator += 'Alt+';

    accelerator += event.key.substring(0, 1).toUpperCase() + event.key.substring(1);
    accelerator = accelerator.replace(/Arrow/g, '');
    accelerator = accelerator.replace(/\+(Shift$|Control$|Alt$)/g, '');
    console.log(accelerator);
    return accelerator;
}

const DELIMITER_REGEX = /(\w\s)|(\s\w)/g;

/**
 * The React component that represents the application's editor.
 */
class TextEditor extends React.Component {

    static normalizeText (text) {
        return text.replace(/(\r\n|\r)/, '\n');
    }

    constructor (props) {
        super(props);
        this.keyMapper = this.props.keyMapper || new DefaultKeyMapper(this);
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
        nextState.text = TextEditor.normalizeText(nextState.text);
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
            const classes = Object.keys(op.attributes || { 'text-block': true });
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
                text: nextProps.text.normalize()
            });
        }
    }

    onKeyPress (event) {
        const accelerator = getAccelerator(event);
        const handled = this.keyMapper.onKeyPress(event, accelerator);
        if (handled)
            event.preventDefault();
    }

    onKeyDown (event) {
        const accelerator = getAccelerator(event);
        const handled = this.keyMapper.onKeyDown(event, accelerator);
        if (handled)
            event.preventDefault();
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

    getNextDelimiterIndex () {
        const selection = this.state.selection;
        const text = this.state.text.substring(selection.end);
        let nextTokenIndex = text.search(DELIMITER_REGEX);
        if (nextTokenIndex === -1)
            nextTokenIndex = this.state.text.length;
        else
            nextTokenIndex = selection.end + nextTokenIndex + 1;

        return nextTokenIndex;
    }

    getPreviousDelimiterIndex () {
        const selection = this.state.selection;
        const text = this.state.text.substring(0, selection.end).split('').reverse().join('');
        let nextTokenIndex = text.search(DELIMITER_REGEX);
        if (nextTokenIndex === -1)
            nextTokenIndex = 0;
        else
            nextTokenIndex = selection.end - nextTokenIndex - 1;

        return nextTokenIndex;
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

    /**
     * Fetches the editor's current content.
     * @returns {string} The current content.
     */
    getCurrentText () {
        return this.state.text;
    }

    getSelection () {
        return this.state.selection;
    }

    setSelection (start = 0, end = this.state.text.length) {
        start = Math.max(0, Math.min(this.state.text.length, start));
        end = Math.max(0, Math.min(this.state.text.length, end));

        this.setState({
            selection: {
                start: start,
                end: end
            }
        });
    }

    moveSelection (xOffset = 0, yOffset = 0) {
        const index = this.getIndexFromOffset(xOffset, yOffset);
        this.setSelection(this.state.selection.start, index);
    }

    moveCaret (xOffset = 0, yOffset = 0) {
        const index = this.getIndexFromOffset(xOffset, yOffset);
        this.setSelection(index, index);
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

    moveCaretNextDelimiter () {
        const tokenIndex = this.getNextDelimiterIndex();
        this.setSelection(tokenIndex, tokenIndex);
    }

    moveCaretPreviousDelimiter () {
        const tokenIndex = this.getPreviousDelimiterIndex();
        this.setSelection(tokenIndex, tokenIndex);
    }

    moveSelectionNextDelimiter () {
        const selection = this.state.selection;
        const tokenIndex = this.getNextDelimiterIndex();
        this.setSelection(selection.start, tokenIndex);
    }

    moveSelectionPreviousDelimiter () {
        const selection = this.state.selection;
        const tokenIndex = this.getPreviousDelimiterIndex();
        this.setSelection(selection.start, tokenIndex);
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
    decorators: React.PropTypes.array,
    keyMapper: React.PropTypes.object,
    tokens: React.PropTypes.object
};

TextEditor.defaultProps = {
    text: '',
    decorators: []
};

class DefaultKeyMapper {

    constructor (editor) {
        this.editor = editor;
        this.keyDownActions = {};
        this.keyUpActions = {};

        this.keyDownActions = {
            'Enter':            () => this.editor.insertText('\n'),
            'Backspace':        () => this.editor.deleteText(),
            'Right':            () => this.editor.moveCaret(+1),
            'Shift+Right':      () => this.editor.moveSelection(+1),
            'Ctrl+Right':       () => this.editor.moveCaretNextDelimiter(),
            'Ctrl+Shift+Right': () => this.editor.moveSelectionNextDelimiter(),
            'Left':             () => this.editor.moveCaret(-1),
            'Shift+Left':       () => this.editor.moveSelection(-1),
            'Ctrl+Left':        () => this.editor.moveCaretPreviousDelimiter(),
            'Ctrl+Shift+Left':  () => this.editor.moveSelectionPreviousDelimiter(),
            'Up':               () => this.editor.moveCaret(0, -1),
            'Shift+Up':         () => this.editor.moveSelection(0, -1),
            'Down':             () => this.editor.moveCaret(0, +1),
            'Shift+Down':       () => this.editor.moveSelection(0, +1),
            'End':              () => this.editor.moveToLineEnd(),
            'Shift+End':        () => this.editor.moveSelectionToLineEnd(),
            'Home':             () => this.editor.moveToLineStart(),
            'Shift+Home':       () => this.editor.moveSelectionToLineStart()
        };
    }

    onKeyPress (event, accelerator) {
        this.editor.insertText(String.fromCodePoint(event.which));
    }

    onKeyDown (event, accelerator) {
        const action = this.keyDownActions[accelerator];
        if (!action)
            return false;

        action();
        return true;
    }

    onKeyUp (event, accelerator) {

    }

}

export default TextEditor;
