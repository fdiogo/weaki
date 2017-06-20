import React from 'react';
import PropTypes from 'prop-types';
import highlight from 'highlight.js';
import { remote } from 'electron';

const weaki = remote.getGlobal('instance');

class CodePreview extends React.Component {

    constructor (props) {
        super(props);
        this.state = {
            code: ''
        };
    }

    componentDidMount () {
        this.updateCode(this.props.filename, this.props.section, this.props.commit);
    }

    componentWillReceiveProps (nextProps) {
        this.updateCode(nextProps.filename, nextProps.section, nextProps.commit);
    }

    updateCode (filename, sectionName = '', commitHash) {
        if (!filename)
            return;

        weaki.fileInterpreter.interpretFile(filename, null, commitHash)
            .then(file => {
                const wantedSection = file.sections.find(section => section.name.indexOf(sectionName) === 0);
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

CodePreview.propTypes = {
    filename: PropTypes.string,
    section: PropTypes.string
};

export default CodePreview;
