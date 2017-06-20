/* eslint-env browser */
import React from 'react';
import PropTypes from 'prop-types';
import { clipboard } from 'electron';
import highlight from 'highlight.js';
import TextEditorNode from './text-editor-node';

import SelectionDecorator from '../../decorators/selection-decorator/selection-decorator';
import CursorDecorator from '../../decorators/cursor-decorator/cursor-decorator';

const DELIMITER_REGEX = /(?!^)\b/g;
const SUGGESTIONS_TIMEOUT = 100;

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

/**
 * The React component that represents the application's editor.
 */
class TextEditor extends React.Component {

    static normalizeText (text) {
        return text.replace(/(\r\n|\r)/, '\n');
    }

    static highlightToNodes (text) {
        const nodes = [];

        const highlighted = highlight.highlightAuto(text);
        const openRegex = /<span class="([a-z\-]+)"/g; // eslint-disable-line
        const closeRegex = /<\/span>/g;

        const openers = getMatches(openRegex, highlighted.value);
        const closers = getMatches(closeRegex, highlighted.value);

        const opened = [];
        let textOffset = 0;
        let closerIndex = 0;
        for (let opener of openers) {
            let nextCloser = closers[closerIndex];
            while (nextCloser.index < opener.index) {
                nextCloser.index -= textOffset;
                textOffset += nextCloser[0].length;
                const tagStart = opened.pop();
                nodes.push(new TextEditorNode(tagStart.index, nextCloser.index, 'span', { className: tagStart[1] }));
                nextCloser = closers[++closerIndex];
            }

            opener.index -= textOffset;
            textOffset += opener[0].length + 1;
            opened.push(opener);
        }

        let nextCloser = closers[closerIndex];
        while (opened.length > 0) {
            nextCloser.index -= textOffset;
            textOffset += nextCloser[0].length + 1;
            const tagStart = opened.pop();
            nodes.push(new TextEditorNode(tagStart.index, nextCloser.index, 'span', { className: tagStart[1] }));
            nextCloser[++closerIndex];
        }

        return nodes;
    }

    static generateDOM (text, selection, decorators, suggestions) {
        const editorNodeRoot = new TextEditorNode(0, text.length, 'span');

        let selectionStart = selection.start;
        let selectionEnd = selection.end;
        if (selection.start > selection.end) {
            selectionStart = selection.end;
            selectionEnd = selection.start;
        }

        const highlightNodes = TextEditor.highlightToNodes(text);
        highlightNodes.forEach(node => editorNodeRoot.tryInsert(node));

        for (let decorator of decorators) {
            const matches = getMatches(decorator.regex, text);
            for (let match of matches) {
                const start = match.index;
                const end = start + match[0].length;
                editorNodeRoot.tryInsert(new TextEditorNode(start, end, decorator, { match: match }));
            }
        }

        const selectionNode = new TextEditorNode(selectionStart, selectionEnd, SelectionDecorator);
        const cursorNode = new TextEditorNode(selection.end, selection.end, CursorDecorator, { suggestions: suggestions });
        editorNodeRoot.tryInsert(selectionNode);
        selectionNode.tryInsert(cursorNode);

        return editorNodeRoot.render(text);
    }

    static getCurrentLine (state) {
        if (!state || !state.selection || !state.text)
            return null;

        const selection = state.selection;
        const text = state.text;

        let startIndex = text.substring(0, selection.end).lastIndexOf('\n') + 1;
        let endIndex = text.substring(selection.end).indexOf('\n');
        if (endIndex === -1)
            endIndex = text.length;
        else
            endIndex += selection.end;

        return {
            start: startIndex,
            end: endIndex,
            text: text.substring(startIndex, endIndex)
        };
    }

    static getCurrentWord (state) {
        if (!state || !state.selection)
            return null;

        const cursorIndex = state.selection.end;
        const text = state.text;

        let startIndex = text.substring(0, cursorIndex).search(/\s[^\s]*$/) + 1;
        startIndex = Math.min(startIndex, text.length - 1);

        let endIndex = text.substring(cursorIndex).search(/(?!^)\S/);
        if (endIndex === -1)
            endIndex = text.length;
        else
            endIndex = Math.max(cursorIndex, Math.min(endIndex + cursorIndex, text.length));

        return {
            start: startIndex,
            end: endIndex,
            text: text.substring(startIndex, endIndex)
        };
    }

    constructor (props) {
        super(props);
        this.keyMapper = this.props.keyMapper || new DefaultKeyMapper(this);
        this.past = [];
        this.future = [];
        this.lastTextInsertTime = Date.now();
        this.lastChangeTime = Date.now();
        this.state = {
            text: this.props.text,
            dom: null,
            selection: {
                start: 0,
                end: 0
            }
        };

        highlight.configure({
            useBR: false,
            languages: ['markdown']
        });
    }

    shouldComponentUpdate (nextProps, nextState) {
        if (this.props.disabled && nextProps.disabled) {
            nextState = this.state;
            return false;
        }

        if (nextState !== this.state || nextState.suggestions !== this.state.suggestions)
            return true;

        return false;
    }

    componentWillUpdate (nextProps, nextState) {
        if (nextState.text !== this.state.text)
            nextState.text = TextEditor.normalizeText(nextState.text);

        const currentTime = Date.now();
        if (currentTime - this.lastChangeTime > SUGGESTIONS_TIMEOUT) {
            this.lastSuggestionsUpdate = currentTime;

            const textDescriptor = {
                currentLine: TextEditor.getCurrentLine(nextState),
                currentWord: TextEditor.getCurrentWord(nextState),
                allText: nextState.text,
                selection: {
                    start: nextState.selection.start,
                    end: nextState.selection.end
                }
            };

            Promise.all(this.props.suggestors.map(suggestor => Promise.resolve(suggestor.getSuggestions(textDescriptor, this))))
                .then(results => {
                    const newSuggestions = [];
                    for (let suggestions of results) {
                        if (!suggestions || suggestions.length < 1)
                            continue;

                        newSuggestions.push(...suggestions);
                    }

                    this.setState({ suggestions: newSuggestions });
                });
        }

        this.lastChangeTime = currentTime;
        nextState.dom = TextEditor.generateDOM(nextState.text, nextState.selection, nextProps.decorators, nextState.suggestions);
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

    onMouseUp () {
        this.updateSelectionFromNative();
    }

    onDoubleClick () {
        this.updateSelectionFromNative();
    }

    updateSelectionFromNative () {
        const selection = document.getSelection();
        let focusElement = selection.focusNode;
        let anchorElement = selection.anchorNode;
        if (!focusElement || !anchorElement)
            return;

        while (focusElement && focusElement !== this.refs.container && (!focusElement.dataset || !focusElement.dataset.start))
            focusElement = focusElement.parentElement;

        if (!focusElement)
            return;

        while (anchorElement && anchorElement !== this.refs.container && (!anchorElement.dataset || !anchorElement.dataset.start))
            anchorElement = anchorElement.parentElement;

        if (!anchorElement)
            return;

        if (focusElement === this.refs.container || anchorElement === this.refs.container)
            return;

        const focusIndex = parseInt(focusElement.dataset.start) + selection.focusOffset;
        const anchorIndex = parseInt(anchorElement.dataset.start) + selection.anchorOffset;
        selection.empty();
        this.setSelection(anchorIndex, focusIndex);
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
            nextTokenIndex = selection.end + nextTokenIndex;

        return nextTokenIndex;
    }

    getPreviousDelimiterIndex () {
        const selection = this.state.selection;
        const text = this.state.text.substring(0, selection.end).split('').reverse().join('');
        let nextTokenIndex = text.search(DELIMITER_REGEX);
        if (nextTokenIndex === -1)
            nextTokenIndex = 0;
        else
            nextTokenIndex = selection.end - nextTokenIndex;

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

    /**
     * @typedef {object} Excerpt
     * @property {number} start The start index of the excerpt.
     * @property {number} end The end index of the excerpt.
     * @property {string} text The excerpt's content.
     */

    /**
     * Obtains the entire line of text on the cursor.
     * @returns {Excerpt} The current line.
     */
    getCurrentLine () {
        return TextEditor.getCurrentLine(this.state);
    }

    /**
     * Obtains the current word on the cursor.
     * @returns {Excerpt} The current word.
     */
    getCurrentWord () {
        return TextEditor.getCurrentWord(this.state);
    }

    isTextSelected () {
        return this.state.selection.start !== this.state.selection.end;
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

    /**
     * Selects all the text in the editor.
     */
    selectAll () {
        this.setState({
            selection: {
                start: 0,
                end: this.state.text.length
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
        this.tryUpdatePast();
        this.clearFuture();

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
        this.tryUpdatePast();
        this.clearFuture();

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

    deleteWord () {
        const selection = this.state.selection;
        const index = this.getPreviousDelimiterIndex();

        const length = selection.end - index;
        const before = this.state.text.substring(0, index);
        const after = this.state.text.substring(selection.end);

        this.setState({
            text: before + after,
            selection: {
                start: selection.start - length,
                end: selection.end - length
            }
        });
    }

    replaceRange (start, end, text) {
        this.tryUpdatePast();
        this.clearFuture();

        const textBefore = this.state.text.substring(0, start);
        const textAfter = this.state.text.substring(end);

        const selection = this.state.selection;
        if (selection.end >= start && selection.end <= end)
            selection.end = start + text.length;
        if (selection.start >= start && selection.start <= end)
            selection.start = start + text.length;

        this.setState({
            text: textBefore + text + textAfter,
            selection: selection
        });
    }

    replaceText (replacementText = '') {
        this.tryUpdatePast();
        this.clearFuture();

        const selection = this.state.selection;
        const isSelectionReversed = selection.start > selection.end;

        let start;
        let end;
        if (isSelectionReversed) {
            start = selection.end;
            end = selection.start;
        } else {
            start = selection.start;
            end = selection.end;
        }

        const before = this.state.text.substring(0, start);
        const after = this.state.text.substring(end);

        const newText = before + replacementText + after;
        this.setState({
            text: newText,
            selection: {
                start: start + replacementText.length,
                end: start + replacementText.length
            }
        });
    }

    tryUpdatePast () {
        const currentTime = Date.now();
        const timeout = currentTime - this.lastTextInsertTime;
        this.lastTextInsertTime = currentTime;

        if (timeout >= this.props.historyTimeout)
            this.updatePast();
    }

    updatePast () {
        this.past.push(this.state);
    }

    clearFuture () {
        this.future.splice(0, this.future.length);
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
        this.replaceText(copiedText);
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
            ref="container"
            tabIndex="0"
            onKeyPress={this.onKeyPress.bind(this)}
            onKeyDown={this.onKeyDown.bind(this)}
            onMouseUp={this.onMouseUp.bind(this)}
            onDoubleClick={this.onDoubleClick.bind(this)}>
            <pre>
                <code>
                    {this.state.dom}
                </code>
            </pre>
        </div>;
    }
}

TextEditor.propTypes = {
    text: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    decorators: PropTypes.array,
    keyMapper: PropTypes.object,
    historyTimeout: PropTypes.number
};

TextEditor.defaultProps = {
    text: '',
    decorators: [],
    suggestors: [],
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
            'Ctrl+Backspace':   () => this.editor.isTextSelected() ? this.editor.deleteText() : this.editor.deleteWord(),
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
            'Ctrl+V':           () => this.editor.paste(),
            'Ctrl+A':           () => this.editor.selectAll()
        };
    }

    onKeyPress (event, accelerator) {
        this.editor.replaceText(String.fromCodePoint(event.which));
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
