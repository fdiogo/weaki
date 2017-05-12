/* eslint-env browser */
import React from 'react';
import Delta from 'quill-delta';
import { clipboard } from 'electron';
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

    static generateDelta (text, selection, decorators) {
        const isReverseSelection = selection.start > selection.end;

        let delta = new Delta().insert(text);

        let selectionStart = isReverseSelection ? selection.end : selection.start;
        let selectionLength = isReverseSelection ? selection.start - selection.end : selection.end - selection.start;
        let selectionDelta = new Delta().retain(selectionStart).retain(selectionLength, { 'class-selected': true });

        delta = delta.compose(selectionDelta);
        for (let decorator of decorators) {
            const matches = getMatches(decorator.regex, text);
            for (let match of matches) {
                const attributes = {};
                const className = decorator.getClass ? 'class-' + decorator.getClass(match) : 'class-decorator';
                attributes[className] = true;

                if (decorator.getPopup)
                    attributes.popup = decorator.getPopup(match);

                if (decorator.events) {
                    attributes.events = {};
                    Object.entries(decorator.events)
                            .map(([eventName, callback]) => [eventName, callback.bind(null, match)])
                            .forEach(([eventName, callback]) => attributes.events[eventName] = callback);
                }

                const decoratorDelta = new Delta().retain(match.index).retain(match[0].length, attributes);
                delta = delta.compose(decoratorDelta);
            }
        }

        return delta;
    }

    static generateDOMElements (delta, cursorIndex) {
        const cursor = document.createElement('span');
        cursor.className = 'blinking-cursor';
        cursor.innerHTML = '<span></span>';

        let characterCount = 0;
        let domElements = [];
        for (let op of delta.ops) {
            op.attributes = op.attributes || { 'class-text-block': true };
            const text = op.insert;
            const element = document.createElement('span');
            const classes = Object.keys(op.attributes)
                                    .filter(prop => prop.indexOf('class-') === 0)
                                    .map(prop => prop.substring('class-'.length));

            element.className = classes.join(' ');
            if (cursorIndex >= characterCount && cursorIndex <= characterCount + text.length) {
                const beforeCursor = document.createTextNode(text.substring(0, cursorIndex - characterCount));
                const afterCursor = document.createTextNode(text.substring(cursorIndex - characterCount));
                element.appendChild(beforeCursor);
                element.appendChild(cursor);
                element.appendChild(afterCursor);
            } else
                element.innerHTML = text;

            characterCount += text.length;

            if (op.attributes.events) {
                Object.entries(op.attributes.events)
                        .forEach(([eventName, callback]) => element.addEventListener(eventName, callback));
            }

            if (op.attributes.popup) {
                const popupElement = document.createElement('span');
                popupElement.className = 'popup';

                if (typeof op.attributes.popup === 'string')
                    popupElement.innerHTML = op.attributes.popup;
                else if (op.attributes.popup instanceof HTMLElement)
                    popupElement.appendChild(op.attributes.popup);

                element.addEventListener('mouseover', () => element.appendChild(popupElement));
                element.addEventListener('mouseleave', () => element.removeChild(popupElement));
            }

            domElements.push(element);
        }

        return domElements;
    }

    constructor (props) {
        super(props);
        this.keyMapper = this.props.keyMapper || new DefaultKeyMapper(this);
        this.past = [];
        this.future = [];
        this.lastTextInsertTime = Date.now();
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

    componentWillUpdate (nextProps, nextState) {
        nextState.text = TextEditor.normalizeText(nextState.text);
        let delta = TextEditor.generateDelta(nextState.text, nextState.selection, nextProps.decorators);
        let domElements = TextEditor.generateDOMElements(delta, nextState.selection.end);

        while (this.refs.root.hasChildNodes())
            this.refs.root.removeChild(this.refs.root.lastChild);

        domElements.forEach(el => this.refs.root.appendChild(el));
    }

    componentDidUpdate (prevProps, prevState) {
        if (this.props.onChange && prevState.text !== this.state.text)
            this.props.onChange(this.state.text);
    }

    componentWillReceiveProps (nextProps) {
        if (nextProps.hasOwnProperty('text')) {
            const text = TextEditor.normalizeText(nextProps.text);
            if (text === this.state.text)
                return;

            this.past.push(this.state);
            this.setState({
                text: text
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
        if (handled || event.key === 'Tab')
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

    getSelectedText () {
        const selection = this.state.selection;
        const text = this.state.text;

        return text.substring(selection.start, selection.end);
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
        const currentTime = Date.now();
        const timeout = currentTime - this.lastTextInsertTime;
        this.lastTextInsertTime = currentTime;
        this.future.splice(0, this.future.length);

        if (timeout >= this.props.historyTimeout)
            this.past.push(this.state);

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

    copy () {
        const selectedText = this.getSelectedText();
        clipboard.writeText(selectedText);
    }

    cut () {
        const selection = this.state.selection;
        if (selection.start === selection.end)
            return;

        const selectedText = this.getSelectedText();
        this.deleteText();
        clipboard.writeText(selectedText);
    }

    paste () {
        const copiedText = clipboard.readText();
        this.insertText(copiedText);
    }

    undo () {
        if (this.past.length === 0)
            return;

        const currentState = this.state;
        const previousState = this.past.pop();
        this.future.push(currentState);
        this.setState(previousState);
    }

    redo () {
        if (this.future.length === 0)
            return;

        const currentState = this.state;
        const nextState = this.future.pop();
        this.past.push(currentState);
        this.setState(nextState);
    }

    render () {
        return <div className="text-editor hljs"
            tabIndex="0"
            onKeyPress={this.onKeyPress.bind(this)}
            onKeyDown={this.onKeyDown.bind(this)}>
            <pre>
                <code ref="root">

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
    historyTimeout: React.PropTypes.number
};

TextEditor.defaultProps = {
    text: '',
    decorators: [],
    historyTimeout: 300
};

class DefaultKeyMapper {

    constructor (editor) {
        this.editor = editor;
        this.keyDownActions = {};
        this.keyUpActions = {};

        this.keyDownActions = {
            'Enter':            () => this.editor.insertText('\n'),
            'Tab':              () => this.editor.insertText('  '),
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
            'Shift+Home':       () => this.editor.moveSelectionToLineStart(),
            'Ctrl+Z':           () => this.editor.undo(),
            'Ctrl+Y':           () => this.editor.redo(),
            'Ctrl+C':           () => this.editor.copy(),
            'Ctrl+X':           () => this.editor.cut(),
            'Ctrl+V':           () => this.editor.paste()
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
