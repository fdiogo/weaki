/* eslint-env browser */
import Decorator from '../decorator';
import ContentAssist from '../../components/content-assist/content-assist';
import React from 'react'; // eslint-disable-line

class CursorDecorator extends Decorator {

    componentWillReceiveProps (nextProps) {
        this.setState({
            popupVisible: nextProps.suggestions.length > 0,
            popup: <ContentAssist suggestions={nextProps.suggestions} />
        });
    }

};

CursorDecorator.breakable = false;
CursorDecorator.defaultProps = {
    class: 'cursor',
    suggestions: []
};

export default CursorDecorator;
