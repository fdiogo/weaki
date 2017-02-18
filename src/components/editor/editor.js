import React from 'react';

const PropTypes = {
    content: React.PropTypes.string
};

class Editor extends React.Component {

    static get propTypes () {
        return PropTypes;
    }

    constructor (props) {
        super(props);
        this.state = {
            content: props.content
        };
    }

    componentWillReceiveProps (nextProps) {
        this.setState(nextProps);
    }

    render () {
        return <textarea value={this.state.content}></textarea>;
    }

}

export default Editor;
