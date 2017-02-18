import React from 'react';

class StatusBar extends React.Component {

    render () {
        return <h1>{this.props.filePath}</h1>;
    }

}

export default StatusBar;
