import React from 'react';
import Decorator from './decorator';

class ReferenceDecorator extends Decorator {

    render () {
        return <span className="reference">{this.props.text}</span>;
    }
}

ReferenceDecorator.regex = /file/ig;

export default ReferenceDecorator;
