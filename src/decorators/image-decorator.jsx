import React from 'react'; // eslint-disable-line
import Decorator from './decorator';
import Image from '../components/image/image';

const NAME_REGEX = /^!\[(.*)\]/;
const URI_REGEX = /\(([^\s]+)(\s.+)?\)$/;
const TITLE_REGEX = /\.*"(.*)"\)$/;

class ImageDecorator extends Decorator {

    constructor (props) {
        super(props);
        this.state = {
            hidden: true,
            validUri: false
        };

        Object.assign(this.state, ImageDecorator.parse(props.text));
    }

    componentWillReceiveProps (nextProps) {
        this.setState(ImageDecorator.parse(nextProps.text));
    }

    render () {
        const classes = ['md-image'];
        if (this.state.validUri)
            classes.push('underlined');

        return <span className={classes.join(' ')}
            onMouseEnter={() => this.setState({hidden: false})}
            onMouseLeave={() => this.setState({hidden: true})}>
            {this.props.text}
            <Image hidden={this.state.hidden}
                src={this.state.uri}
                onLoad={() => this.setState({validUri: true})}
                onError={() => this.setState({validUri: false})}>
                </Image>
        </span>;
    }

    static parse (text) {
        const results = {
            name: null,
            uri: null,
            title: null
        };

        const nameExec = NAME_REGEX.exec(text);
        const uriExec = URI_REGEX.exec(text);
        const titleExec = TITLE_REGEX.exec(text);

        if (nameExec && nameExec[1] && typeof nameExec[1] === 'string')
            results.name = nameExec[1];

        if (uriExec && uriExec[1] && typeof uriExec[1] === 'string')
            results.uri = uriExec[1];

        if (titleExec && titleExec[1] && typeof titleExec[1] === 'string')
            results.title = titleExec[1];

        return results;
    }
}

ImageDecorator.regex = /!\[.*\](.*)/g;

export default ImageDecorator;
