import React from 'react';

class StatusBar extends React.Component {

    render () {
        return <div id="status-bar">
            <span id="status-bar-filepath">{this.props.filePath}</span>
        </div>;
    }

}

export default StatusBar;
