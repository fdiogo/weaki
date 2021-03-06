import React from 'react';
import ReactMarkdown from 'react-markdown';

class Preview extends React.Component {

    render () {
        return <ReactMarkdown className="markdown-preview" source={this.props.file.currentContent || ''} />;
    }

}

export default Preview;
