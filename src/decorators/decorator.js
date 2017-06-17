import React from 'react';
import PropTypes from 'prop-types';

class Decorator extends React.Component {

    constructor (props) {
        super(props);
        this.state = {
            popup: null,
            popupVisible: false,
            containerProps: {
                className: this.props.className
            }
        };
    }

    componentWillUpdate (nextProps, nextState) {
        if (!nextState.containerProps.hasOwnProperty('className'))
            nextState.containerProps.className = nextProps.className;
    }

    render () {
        const popup = this.state.popupVisible && this.state.popup
            ? <span className="popup">{this.state.popup}</span>
            : null;

        return React.createElement('span', this.state.containerProps, this.props.children, popup);
    }

}

Decorator.regex = null;
Decorator.breakable = true;

Decorator.propTypes = {
    className: PropTypes.string
};

Decorator.defaultProps = {
    className: 'decorator'
};

export default Decorator;
