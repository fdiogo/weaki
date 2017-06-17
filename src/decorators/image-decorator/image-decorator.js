/* eslint-env browser */
import Decorator from '../decorator';
import React from 'react'; // eslint-disable-line

class ImageDecorator extends Decorator {

    constructor (props) {
        super(props);
        this.state.src = this.props.match ? this.props.match[2] : null;
    }

    componentDidMount () {
        this.setState({
            containerProps: {
                onMouseEnter: this.onMouseEnter.bind(this),
                onMouseLeave: this.onMouseLeave.bind(this)
            }
        });
    }

    componentWillReceiveProps (nextProps) {
        this.setState({
            src: nextProps.match ? nextProps.match[2] : null
        });
    }

    componentWillUpdate (nextProps, nextState) {
        super.componentWillUpdate(nextProps, nextState);
        nextState.popup = <img src={nextState.src} />;
    }

    onMouseEnter (event) {
        this.setState({ popupVisible: true });
    }

    onMouseLeave (event) {
        this.setState({ popupVisible: false });
    }
}

ImageDecorator.regex = /!\[([^\]]*)\]\(([^)]*)\)/g;
ImageDecorator.defaultProps = {
    className: 'image-link'
};
export default ImageDecorator;
