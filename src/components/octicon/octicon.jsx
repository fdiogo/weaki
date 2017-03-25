import React from 'react';
import octicons from 'octicons';

class Octicon extends React.Component {

    render () {
        return <span dangerouslySetInnerHTML={{__html: octicons[this.props.name].toSVG()}}></span>;
    }

}

export default Octicon;
