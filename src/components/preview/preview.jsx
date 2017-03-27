import React from 'react';
import ReactMarkdown from 'react-markdown';

class Preview extends React.Component {

    render () {
        return <ReactMarkdown source={this.props.file.lastSavedContent} />;
    }
    
}

export default Preview;
