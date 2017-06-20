import { ipcRenderer, remote } from 'electron';
import path from 'path';
import React from 'react';
import FileTree from '../../file-tree';

const weaki = remote.getGlobal('instance');

/**
 * A component which represents a clickable file tree.
 * @class Explorer
 */
class Explorer extends React.Component {

    constructor (props) {
        super(props);
        this.state = {
            workspace: '',
            fileTree: new FileTree(),
            ignoredFiles: weaki.config.ignoredFiles || []
        };

        ipcRenderer.on('application:file-loaded', this.onFileLoaded.bind(this));
        ipcRenderer.on('application:file-created', this.onFileCreated.bind(this));
        ipcRenderer.on('application:directory-loaded', this.onDirectoryLoaded.bind(this));
        ipcRenderer.on('application:workspace-changed', this.onWorkspaceChange.bind(this));
    }

    shouldComponentUpdate (nextProps, nextState) {
        return nextState !== this.state || nextProps.file.path !== this.props.file.path;
    }

    isPathIgnored (fullPath) {
        for (const ignoredPath of this.state.ignoredFiles) {
            try {
                if (fullPath.match(ignoredPath))
                    return true;
            } catch (error) {
                console.log(`Invalid ignore path: ${ignoredPath}`);
                this.state.ignoredFiles.splice(this.state.ignoredFiles.indexOf(ignoredPath), 1);
            }
        }

        return false;
    }

    /**
    * Adds the file to the state and sets it as the current.
    * @param {Object} event - The event descriptor.
    * @param {string} filePath - The path of the file.
    * @param {string} content - The content of the file.
    * @listens application:file-loaded
    */
    onFileLoaded (event, filePath, content) {
        const node = this.state.fileTree.addFile(filePath);
        node.hidden = this.isPathIgnored(filePath);
    }

    onFileCreated (event, filePath) {
        const node = this.state.fileTree.addFile(filePath);
        node.hidden = this.isPathIgnored(filePath);
    }

    onDirectoryLoaded (event, directory, files) {
        const dirNode = this.state.fileTree.addDirectory(directory);
        dirNode.hidden = this.isPathIgnored(directory);

        for (let file of files) {
            if (this.isPathIgnored(file.path))
                continue;

            let node = null;
            if (file.isDirectory)
                node = this.state.fileTree.addDirectory(file.path);
            else
                node = this.state.fileTree.addFile(file.path);

            node.hidden = dirNode.hidden || this.isPathIgnored(file.path);
        }

        this.forceUpdate();
    }

    onWorkspaceChange (event, newWorkspace) {
        this.state.workspace = newWorkspace;
        this.state.fileTree.clear();
        this.state.ignoredFiles = weaki.projectConfig.ignoredFiles || this.state.ignoredFiles;
        this.forceUpdate();
    }

    render () {
        console.log('Explorer updated');
        const rootNode = this.state.fileTree.getWorkspaceNode();

        return <ul className='explorer-tree'>
            {rootNode !== this.state.fileTree.root ? ExplorerItem.fromNode(rootNode, this.props.file) : []}
        </ul>;
    }

}

class ExplorerItem extends React.Component {

    static fromNode (node, openedFile = {}) {
        if (node.isDirectory)
            return <ExplorerDirectory key={node.fullPath} {...node} openedFile={openedFile}/>;
        else
            return <ExplorerFile key={node.fullPath} {...node} selected={node.fullPath === openedFile.path} />;
    }
}

class ExplorerFile extends ExplorerItem {

    onClick () {
        ipcRenderer.send('execute-command', 'application:open-file', this.props.fullPath);
    }

    render () {
        const classes = ['explorer-item'];
        if (this.props.selected)
            classes.push('explorer-item-file-selected');
        else
            classes.push('explorer-item-file');

        return <div className={classes.join(' ')}>
            <div className="explorer-item-title" onClick={this.onClick.bind(this)}>
                <span className="octicon-white octicon-file"></span>
                {this.props.name}
            </div>
        </div>;
    }

}

class ExplorerDirectory extends ExplorerItem {

    constructor (props) {
        super(props);
        this.state = {
            collapsed: true
        };
    }

    onClick () {
        this.setState({ collapsed: !this.state.collapsed });
    }

    render () {
        const children = [];
        if (!this.state.collapsed) {
            const sorted = Object.values(this.props.children).filter(node => !node.hidden).sort((a, b) => {
                if (a.isDirectory && !b.isDirectory)
                    return -1;
                if (!a.isDirectory && b.isDirectory)
                    return 1;

                if (a.name.toLowerCase() <= b.name.toLowerCase())
                    return -1;

                return 1;
            });

            for (let childNode of sorted)
                children.push(ExplorerItem.fromNode(childNode, this.props.openedFile));
        }

        const chevronClasses = ['octicon-white'];
        if (this.state.collapsed)
            chevronClasses.push('octicon-chevron-right');
        else
            chevronClasses.push('octicon-chevron-down');

        return <div className="explorer-item explorer-item-directory">
            <div className="explorer-item-title" onClick={this.onClick.bind(this)}>
                <span className={chevronClasses.join(' ')}></span>
                <span className="octicon-white octicon-file-directory"></span>
                {this.props.name}
            </div>
            {children}
        </div>;
    }

}

export default Explorer;
