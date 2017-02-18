import React from 'react';
import { render } from 'react-dom';
import EventRegistry from './event-registry';

import Explorer from './components/explorer/explorer';
import Editor from './components/editor/editor';

class Window extends React.Component {

    constructor (props) {
        super(props);
        this.eventRegistry = new EventRegistry();
    }

    render () {
        return <div id="viewport">
            <div id="workspace">
                <div id="left-sidebar">
                    <Explorer name='hey'></Explorer>
                </div>
                <div id="main-panel">
                    <Editor content="nothin'"></Editor>
                </div>
                <div id="right-sidebar">
                </div>
            </div>
            <div id="status-bar">
            </div>
        </div>;
    }
};

render(
    <Window></Window>,
    document.getElementById('root')
);
