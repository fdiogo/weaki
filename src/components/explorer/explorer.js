import React from 'react';

const PropTypes = {
    name: React.PropTypes.string
};

class Explorer extends React.Component {

    static get propTypes () {
        return PropTypes;
    }

    render () {
        return <ul>{this.props.name}</ul>;
    }
}

export default Explorer;
