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
            content: props.content || ''
        };
    }

    componentWillReceiveProps (nextProps) {
        this.setState(nextProps);
    }

    handleOnChange (event) {
        this.setState({
            content: event.target.value
        });
    }

    render () {
        return <textarea
            id="editor-content"
            value={this.state.content}
            onChange={this.handleOnChange}>
        </textarea>;
    }
}

export default Editor;
