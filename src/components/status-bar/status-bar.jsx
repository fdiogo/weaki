import React from 'react';

class StatusBar extends React.Component {

    render () {
        return <div id="status-bar">
            <span id="status-bar-filepath">{this.props.file.path}</span>
        </div>;
    }

}

export default StatusBar;
