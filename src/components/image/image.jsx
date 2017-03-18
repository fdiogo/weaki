import React from 'react';

const PropTypes = {
    src: React.PropTypes.string,
    hidden: React.PropTypes.bool,
    onLoad: React.PropTypes.func,
    onError: React.PropTypes.func
};

class Image extends React.Component {

    static get propTypes () {
        return PropTypes;
    }

    constructor (props) {
        super(props);
        this.state = {
            hidden: true
        };
    }

    onError () {
        this.setState({ hidden: true });
        if (this.props.onError)
            this.props.onError();
    }

    onLoad () {
        this.setState({ hidden: false });
        if (this.props.onLoad)
            this.props.onLoad();
    }

    render () {
        return <img className={this.state.hidden || this.props.hidden ? 'image hidden' : 'image'}
            src={this.props.src}
            onError={this.onError.bind(this)}
            onLoad={this.onLoad.bind(this)}>
        </img>;
    }

}

export default Image;
