import React from 'react';

const PropTypes = {
    name: React.PropTypes.string
};

class Explorer extends React.Component {

    static get propTypes () {
        return PropTypes;
    }

    render () {
        return <h1>{this.props.name}</h1>;
    }
}

export default Explorer;
