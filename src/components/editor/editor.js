import React from 'react';

const PropTypes = {
    content: React.PropTypes.string.isRequired,
    onUpdate: React.PropTypes.func
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

        if (this.props.onUpdate)
            this.props.onUpdate(event.target.value);
    }

    render () {
        return <textarea
            id="editor-content"
            value={this.state.content}
            onChange={this.handleOnChange.bind(this)}>
        </textarea>;
    }
}

export default Editor;
