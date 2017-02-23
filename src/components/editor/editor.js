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
        return <div id="editor">
            <div id="editor-buttons">
                <span className="editor-button"><img src="../assets/glyphicons-103-bold.png"/></span>
                <span className="editor-button"><img src="../assets/glyphicons-102-italic.png"/></span>
                <span className="editor-button"><img src="../assets/glyphicons-104-text-underline.png"/></span>
                <span className="editor-button"><img src="../assets/glyphicons-105-text-strike.png"/></span>
                <span className="editor-button"><img src="../assets/glyphicons-51-link.png"/></span>
                <span className="editor-button"><img src="../assets/glyphicons-460-header.png"/></span>
                <span className="editor-button"><img src="../assets/glyphicons-115-list.png"/></span>
                <span className="editor-button"><img src="../assets/glyphicons-710-list-numbered.png"/></span>
            </div>
            <textarea
                id="editor-content"
                value={this.state.content}
                onChange={this.handleOnChange.bind(this)}>
            </textarea>
        </div>;
    }
}

export default Editor;
