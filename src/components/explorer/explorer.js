import { ipcRenderer } from 'electron';
import React from 'react';
import path from 'path';

const PropTypes = {
    openFiles: React.PropTypes.array
};

class Explorer extends React.Component {

    static get propTypes () {
        return PropTypes;
    }

    constructor (props) {
        super(props);
        this.state = {
            openFiles: props.openFiles || []
        };
    }

    componentWillReceiveProps (nextProps) {
        this.setState({
            openFiles: nextProps.openFiles
        });
    }

    render () {
        let entries = [];
        for (let filePath of this.state.openFiles) {
            const fileName = path.basename(filePath);
            const onClickHandler = initiateOpenFileCommand.bind(this, filePath);
            entries.push(<li key={filePath} onClick={onClickHandler}>{fileName}</li>);
        }

        return <ul>{entries}</ul>;
    }

}

function initiateOpenFileCommand (filePath) {
    ipcRenderer.send('execute-command', 'editor:open-file', filePath);
}

export default Explorer;
