import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

class ContentAssist extends React.Component {

    constructor (props) {
        super(props);
        this.state = {
            selected: 0
        };
    }

    componentDidMount () {
        ReactDOM.findDOMNode(this.refs.container).focus();
    }

    componentDidUpdate () {
        ReactDOM.findDOMNode(this.refs.container).focus();
    }

    onKeyPress (event) {
        event.preventDefault();
        event.stopPropagation();

        if (event.which === 'ArrowDown')
            this.setState({ selected: Math.min(this.props.suggestions.length, this.state.selected + 1) });
        else if (event.which === 'ArrowDown')
            this.setState({ selected: Math.max(0, this.state.selected - 1) });
    }

    render () {
        const suggestions = this.props.suggestions.map((suggestion, index) => {
            return <Suggestion {...suggestion}
                key={index}
                selected={index === this.state.selected}/>;
        });

        return <span ref="container"
            className="content-assist"
            onKeyPress={this.onKeyPress.bind(this)}>
            {suggestions}
        </span>;
    }

};

class Suggestion extends React.Component {

    render () {
        let classes = ['content-assist-suggestion'];
        if (this.props.selected)
            classes.push('content-assist-suggestion-selected');

        return <div className={classes.join(' ')} onClick={this.props.action}>
            <span className={this.props.icon}></span>
            {this.props.text}
        </div>;
    }
};

ContentAssist.PropTypes = {
    suggestions: PropTypes.arrayOf(Suggestion.PropTypes)
};

ContentAssist.defaultProps = {
    suggestions: []
};

Suggestion.PropTypes = {
    icon: PropTypes.string,
    text: PropTypes.string,
    action: PropTypes.func,
    selected: PropTypes.bool
};

export default ContentAssist;
export { ContentAssist, Suggestion };
