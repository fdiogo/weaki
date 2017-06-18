/* eslint-env browser */
import Decorator from '../decorator';
import CodePreview from '../../components/code-preview/code-preview';
import React from 'react'; // eslint-disable-line
import { remote } from 'electron';

const weaki = remote.getGlobal('instance');

class ReferenceDecorator extends Decorator {

    static generatePopup (match) {
        const filename = match[1];
        const section = match[2];
        if (!section)
            return null;

        return <CodePreview filename={filename} section={section} />;
    }

    componentDidMount () {
        this.setState({
            containerProps: {
                onClick: this.onClick.bind(this),
                onMouseMove: this.onMouseMove.bind(this),
                onMouseLeave: this.onMouseLeave.bind(this)
            },
            filename: this.props.match ? this.props.match[1] : null,
            section: this.props.match ? this.props.match[2] : null
        });
    }

    componentWillUpdate (nextProps, nextState) {
        super.componentWillUpdate(nextProps, nextState);
        nextState.popup = <CodePreview filename={nextState.filename} section={nextState.section} />;
    }

    componentWillReceiveProps (nextProps) {
        this.setState({
            filename: nextProps.match ? nextProps.match[1] : null,
            section: nextProps.match ? nextProps.match[2] : null
        });
    }

    onClick (event) {
        if (this.state.filename && event.ctrlKey)
            weaki.executeCommand('application:open-file', this.state.filename);
    }

    onMouseMove (event) {
        if (event.shiftKey)
            this.state.containerProps.className = 'reference-preview';
        else
            this.state.containerProps.className = 'reference';

        if (event.ctrlKey)
            this.state.popupVisible = true;

        this.forceUpdate();
    }

    onMouseLeave (event) {
        this.state.containerProps.className = 'reference';

        this.setState({
            popupVisible: false
        });
    }

}

ReferenceDecorator.regex = /\[([^\]@]*)(?:@([^\]#]*))?(?:#([A-Za-z0-9~^]*))?\]/g;
ReferenceDecorator.breakable = false;
ReferenceDecorator.defaultProps = { className: 'reference' };
export default ReferenceDecorator;
