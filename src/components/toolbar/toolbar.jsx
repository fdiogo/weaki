import React from 'react';
import path from 'path';
import Octicon from '../octicon/octicon';

class Toolbar extends React.Component {

    constructor (props) {
        super(props);
        this.state = {
            active: this.props.active || this.props.files[0] || {},
            fileMap: {}
        };
        this.props.files.forEach(file => this.state.fileMap[file.path] = file);
    }

    componentWillReceiveProps (nextProps) {
        let active = nextProps.active;
        if (nextProps.active && nextProps.files.some(file => file === nextProps.active) === false)
            active = nextProps.files[0] || {};

        const newFileMap = {};
        nextProps.files.forEach(file => newFileMap[file.path] = file);
        this.setState({
            active: active,
            fileMap: newFileMap
        });
    }

    onClick (file) {
        if (this.props.onClick)
            this.props.onClick(file);
    }

    render () {
        const tabs = this.props.files.map((file, index) => {
            return <ToolbarTab {...file}
                key={file.path}
                active={this.state.active.path === file.path}
                onClick={this.onClick.bind(this, file)} />;
        });

        return <div className="toolbar">
            {tabs}
        </div>;
    }

}

class ToolbarTab extends React.Component {

    render () {
        const classes = ['toolbar-tab'];
        if (this.props.active)
            classes.push('toolbar-tab-active');

        return <span className={classes.join(' ')} onClick={this.props.onClick}>
            {path.basename(this.props.path)}
            {this.props.pendingChanges ? <Octicon name="primitive-dot"></Octicon> : []}
        </span>;
    }

}

export default Toolbar;
