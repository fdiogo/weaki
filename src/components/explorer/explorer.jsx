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

        return <ul id='explorer-tree'>
            {rootNode !== this.state.fileTree.root ? <ExplorerItem key={rootNode.fullPath} {...rootNode}></ExplorerItem> : []}
        </ul>;
    }

}

class ExplorerItem extends React.Component {

    constructor (props) {
        super(props);
        this.state = {
            collapsed: true
        };
    }

    onClick () {
        if (this.props.isDirectory)
            this.setState({ collapsed: !this.state.collapsed });
        else
            ipcRenderer.send('execute-command', 'application:open-file', this.props.fullPath);
    }

    render () {
        const children = [];
        if (!this.state.collapsed) {
            for (let name in this.props.children) {
                const childNode = this.props.children[name];
                children.push(<ExplorerItem key={childNode.fullPath} {...childNode}></ExplorerItem>);
            }
        }

        const tag = this.props.isDirectory ? 'ul' : 'li';
        const itemTitle = <span className='explorer-tree-item-title'
            onClick={this.onClick.bind(this)}>
            {this.props.name}
        </span>;
        return React.createElement(tag, null, itemTitle, children);
    }
}

export default Explorer;
