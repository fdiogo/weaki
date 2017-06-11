import React from 'react';
import highlight from 'highlight.js';
import { remote } from 'electron';

const weaki = remote.getGlobal('instance');

class CodePreview extends React.Component {

    constructor (props) {
        super(props);
        this.state = {
            code: ''
        };

        weaki.fileInterpreter.interpretFile(this.props.filename)
            .then(file => {
                const wantedSection = file.sections.find(section => section.name.indexOf(this.props.section) === 0);
                if (wantedSection)
                    this.setState({ code: file.text.substring(wantedSection.start, wantedSection.end) });
            })
            .catch(console.log);
    }

    render () {
        const highlightedCode = highlight.highlightAuto(this.state.code, ['javascript']).value;

        return <code dangerouslySetInnerHTML={{__html: highlightedCode}}>
        </code>;
    }

}

export default CodePreview;
