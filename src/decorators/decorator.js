import React from 'react';
import PropTypes from 'prop-types';

class Decorator extends React.Component {

    constructor (props) {
        super(props);
        this.state = {
            class: props.class,
            popupVisible: false
        };
    }

    componentWillReceiveProps (nextProps) {
        if (nextProps.class !== this.state.class)
            this.setState({ class: nextProps.class });
    }

    render () {
        const popup = this.state.popupVisible && this.state.popup
            ? <span className="popup">{this.state.popup}</span>
            : null;

        return <span className={this.state.class}>
            {this.props.children}
            {popup}
        </span>;
    }

}

Decorator.regex = null;
Decorator.breakable = true;

Decorator.propTypes = {
    class: PropTypes.string
};

Decorator.defaultProps = {
    class: 'decorator'
};

export default Decorator;
