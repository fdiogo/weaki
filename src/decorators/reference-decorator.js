import React from 'react';

class ReferenceDecorator extends React.Component {

    render () {
        return <span class="reference">{this.props.text}</span>;
    }
}

export default ReferenceDecorator;
