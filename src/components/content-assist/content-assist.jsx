import React from 'react';
import PropTypes from 'prop-types';

class ContentAssist extends React.Component {

    constructor (props) {
        super(props);
        this.state = {
            selected: 0
        };
    }

    render () {
        const suggestions = this.props.suggestions.map((suggestion, index) => {
            return <Suggestion {...suggestion}
                key={index}
                selected={index === this.state.selected}/>;
        });

        return <span className="content-assist">
            {suggestions}
        </span>;
    }

};

class Suggestion extends React.Component {

    render () {
        let className = 'content-assist-suggestion';
        if (this.props.selected)
            className += '-selected';

        return <div className={className} onClick={this.props.action}>
            <span className="octicon-white octicon-git-branch"></span>
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

Suggestion.Type = {
    CODE: 0,
    GIT: 1
};

Suggestion.PropTypes = {
    type: PropTypes.number,
    text: PropTypes.string,
    action: PropTypes.func,
    selected: PropTypes.bool
};

export default ContentAssist;
export { ContentAssist, Suggestion };
