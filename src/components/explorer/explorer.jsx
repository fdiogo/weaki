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
            {rootNode !== this.state.fileTree.root ? <ExplorerItem key={rootNode.fullPath} {...rootNode}></ExplorerItem> : []}
        </ul>;
    }

}

const COLLAPED_IMAGE = '../assets/octicon-chevron-right.svg';
const NON_COLLAPED_IMAGE = '../assets/octicon-chevron-down.svg';

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

        const classes = [];
        let titlePrefix = <span className="explorer-item-title-prefix"></span>;
        if (this.props.isDirectory) {
            classes.push('explorer-item-directory');
            if (Object.keys(this.props.children).length > 0) {
                const imageSrc = this.state.collapsed ? COLLAPED_IMAGE : NON_COLLAPED_IMAGE;
                const imageClasses = ['explorer-item-title-prefix', 'explorer-item-directory-chevron'];
                titlePrefix = <img className={imageClasses.join(' ')} src={imageSrc}></img>;
            }
        } else
            classes.push('explorer-item-file');

        return <div className={classes.join(' ')}>
            <div className="explorer-item-title"
                onClick={this.onClick.bind(this)}>
                {titlePrefix}
                {this.props.name}
            </div>
            {children}
        </div>;
    }
}

export default Explorer;
