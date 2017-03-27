import { ipcRenderer } from 'electron';
import React from 'react';
import { render } from 'react-dom';
import { Router, Route } from 'react-router-dom';
import History from 'history/createMemoryHistory';
import path from 'path';

import Explorer from './components/explorer/explorer';
import Editor from './components/editor/editor';
import StatusBar from './components/status-bar/status-bar';
import GitCommit from './components/git-commit/git-commit';
import FileHistory from './components/file-history/file-history';
import Preview from './components/preview/preview';

/**
 * This React component represents the main window of the application
 * which contains all the other components.
 */
class Window extends React.Component {

    constructor (props) {
        super(props);
        this.state = {
            currentFile: {},
            rightSidebarHistory: History({
                initialEntries: ['/history'],
                initialIndex: 0,
                getUserConfirmation: null
            })
        };

        this.sidebarComponents = [
            { route: '/history', component: FileHistory },
            { route: '/git/commit', component: GitCommit },
            { route: '/preview', component: Preview }
        ];

        ipcRenderer.on('application:open-on-right-sidebar', this.onOpenOnRightSidebar.bind(this));
        // ipcRenderer.on('application:file-loaded', this.onFileLoaded.bind(this));
        // ipcRenderer.on('application:file-modified', this.onFileModified.bind(this));
    }

    /**
     * Adds the file to the state and sets it as the current.
     * @param {Object} event - The event descriptor.
     * @param {string} filePath - The path of the file.
     * @param {string} content - The content of the file.
     * @listens application:file-loaded
     */
    onFileLoaded (event, filePath, content) {
        const file = {
            path: filePath,
            lastSavedContent: content
        };

        this.setState({ currentFile: file });
    }

    onFileModified (event, filePath, newContent) {
        if (this.state.currentFile.path !== filePath)
            return;

        const file = {
            path: filePath,
            lastSavedContent: newContent
        };

        this.setState({ currentFile: file });
    }

    /**
     * Opens a component, via its route, on the right sidebar.
     * @param {string} route - The route of the component.
     */
    onOpenOnRightSidebar (event, route) {
        this.state.rightSidebarHistory.push(route);
        this.forceUpdate();
    }

    render () {
        const sidebarRoutes = [];
        for (let entry of this.sidebarComponents) {
            const component = React.createElement(entry.component, { file: this.state.currentFile });
            const route = <Route key={entry.route} path={entry.route} render={() => component} />;
            sidebarRoutes.push(route);
        }

        return <div id="viewport">
            <base href={this.state.currentFile.path ? path.dirname(this.state.currentFile.path) + path.sep : '.'}/>
            <div id="workspace">
                <div id="left-sidebar">
                    <Explorer file={this.state.currentFile}/>
                </div>
                <div id="main-panel">
                    <Editor onFileChange={file => this.setState({ currentFile: file })}/>
                </div>
                <Router history={this.state.rightSidebarHistory}>
                    <div id="right-sidebar">
                        {sidebarRoutes}
                    </div>
                </Router>
            </div>
            <div id="bottom-bar">
                <StatusBar file={this.state.currentFile}/>
            </div>
        </div>;
    }
};

render(
    <Window></Window>,
    document.getElementById('root')
);
