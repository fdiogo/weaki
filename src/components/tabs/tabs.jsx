import React from 'react';

class Toolbar extends React.Component {

    onClick (data) {
        if (this.props.onClick)
            this.props.onClick(data);
    }

    render () {
        const tabs = this.props.data.map((data, index) => {
            return <ToolbarTab key={index}
                data={data}
                active={this.props.active(data)}
                display={this.props.getTabDisplay ? this.props.getTabDisplay(data) : data.toString()}
                onClick={this.onClick.bind(this, data)} />;
        });

        return <div className="tabs">
            {tabs}
        </div>;
    }

}

class ToolbarTab extends React.Component {

    render () {
        const classes = ['tabs-tab'];
        if (this.props.active)
            classes.push('tabs-tab-active');

        return <span className={classes.join(' ')} onClick={this.props.onClick}>
            {this.props.display}
        </span>;
    }

}

export default Toolbar;
