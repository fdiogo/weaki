import { ipcRenderer } from 'electron';
import React from 'react';

const PropTypes = {
    fileTree: React.PropTypes.object
};

/**
 * A component which represents a clickable file tree.
 * @class Explorer
 */
class Explorer extends React.Component {

    static get propTypes () {
        return PropTypes;
    }

    constructor (props) {
        super(props);
        this.state = {
            fileTree: props.fileTree
        };
    }

    componentWillReceiveProps (nextProps) {
        this.setState({
            fileTree: nextProps.fileTree
        });
    }

    render () {
        const rootNode = this.state.fileTree.getWorkspaceNode();

        return <ul className='explorer-tree'>
            {rootNode !== this.state.fileTree.root ? ExplorerItem.fromNode(rootNode) : []}
        </ul>;
    }

}

class ExplorerItem extends React.Component {

    static fromNode (node) {
        if (node.isDirectory)
            return <ExplorerDirectory key={node.fullPath} {...node} />;
        else
            return <ExplorerFile key={node.fullPath} {...node} />;
    }
}

class ExplorerFile extends ExplorerItem {

    onClick () {
        ipcRenderer.send('execute-command', 'application:open-file', this.props.fullPath);
    }

    render () {
        return <div className="explorer-item explorer-item-file">
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
            for (let name in this.props.children) {
                const childNode = this.props.children[name];
                children.push(ExplorerItem.fromNode(childNode));
            }
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
