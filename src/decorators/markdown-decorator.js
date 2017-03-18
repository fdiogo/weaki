/*
import Immutable from 'immutable';
import highlight from 'highlight.js';
*/
import { CompositeDecorator } from 'draft-js';
import React from 'react'; //eslint-disable-line
import ImageDecorator from './image-decorator/image-decorator';

class MarkdownDecorator extends CompositeDecorator {

    /*
    constructor () {
        this.components = {};
    }

    getDecorations (block) {
        const blockKey = block.getKey();
        const blockText = block.getText();
        const output = highlight.highlight('markdown', blockText, true);
        const element = React.createElement('span', null, output);
        this.components[blockKey] = (props) => ;
        const decorations = new Array(blockText.length).fill(blockKey);

        return Immutable.List(decorations);
    }

    getComponentForKey (key) {
        return this.components[key];
    }

    getPropsForKey (key) {
        return {};
    }
    */

    constructor () {
        super([
            {
                strategy: (contentBlock, callback) => findWithRegex(/#\s*.*/g, contentBlock, callback),
                component: (props) => <span className="md-header">{props.children}</span>
            },
            {
                strategy: (contentBlock, callback) => findWithRegex(/\*\*.*\*\*/g, contentBlock, callback),
                component: (props) => <span className="md-bold">{props.children}</span>
            },
            {
                strategy: (contentBlock, callback) => findWithRegex(/_.*_/g, contentBlock, callback),
                component: (props) => <span className="md-italic">{props.children}</span>
            },
            {
                strategy: (contentBlock, callback) => findWithRegex(/~~.*~~/g, contentBlock, callback),
                component: (props) => <span className="md-strike-through">{props.children}</span>
            },
            {
                strategy: (contentBlock, callback) => findWithRegex(/!\[.*\](.*)/g, contentBlock, callback),
                component: (props) => <ImageDecorator {...props}></ImageDecorator>
            },
            {
                strategy: (contentBlock, callback) => findWithRegex(/\[.*\]\(.*\)/g, contentBlock, callback),
                component: (props) => <span className="md-link">{props.children}</span>
            },
            {
                strategy: (contentBlock, callback) => findWithRegex(/1\.\s.*/g, contentBlock, callback),
                component: (props) => <span className="md-ordered-list">{props.children}</span>
            },
            {
                strategy: (contentBlock, callback) => findWithRegex(/\*\s.*/g, contentBlock, callback),
                component: (props) => <span className="md-unordered-list">{props.children}</span>
            }
        ]);
    }
}

function findWithRegex (regex, contentBlock, callback) {
    const text = contentBlock.getText();
    let matchArr, start;
    while ((matchArr = regex.exec(text)) !== null) {
        start = matchArr.index;
        callback(start, start + matchArr[0].length);
    }
}

export default MarkdownDecorator;
