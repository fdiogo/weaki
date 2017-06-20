import React from 'react';

class Resizable extends React.Component {

    componentDidMount () {
        this.originalWidth = this.refs.container.clientWidth;
        this.originalHeight = this.refs.container.clientHeight;
    }

    render () {
        return <div ref="container" className="resizable">
            { this.props.left
                ? <ResizeBar horizontal horizontalDirection="-1"
                    onNewWidth={this.onNewWidth.bind(this)}
                    onDragEnd={widthOffset => this.originalWidth += widthOffset} />
                : null }
            <span className="resizable-content">
                { this.props.children }
            </span>
            { this.props.right
                ? <ResizeBar horizontal
                    onNewWidth={this.onNewWidth.bind(this)}
                    onDragEnd={widthOffset => this.originalWidth += widthOffset} />
                : null }
        </div>;
    }

    onNewWidth (offset) {
        this.refs.container.style.width = `${this.originalWidth + offset}px`;
    }
}

class ResizeBar extends React.Component {

    constructor (props) {
        super(props);
        this.isMouseDown = false;
        document.addEventListener('mousemove', this.onMouseMove.bind(this));
        document.addEventListener('mouseup', this.onMouseUp.bind(this));
    }

    render () {
        const className = this.props.horizontal ? 'resizable-horizontal' : 'resizable-vertical';
        return <span className={className}
            onMouseDown={this.onMouseDown.bind(this)}>
        </span>;
    }

    onMouseDown (event) {
        this.isMouseDown = true;
        this.originalX = event.screenX;
        this.originalY = event.screenY;
    }

    onMouseUp (event) {
        if (this.isMouseDown && this.props.onDragEnd) {
            const widthOffset = (event.screenX - this.originalX) * this.props.horizontalDirection;
            const heightOffset = (event.screenY - this.originalY) * this.props.verticalDirection;
            this.props.onDragEnd(widthOffset, heightOffset);
        }

        this.isMouseDown = false;
    }

    onMouseMove (event) {
        if (this.isMouseDown === false || event.screenX === 0)
            return;

        const widthOffset = (event.screenX - this.originalX) * this.props.horizontalDirection;
        const heightOffset = (event.screenY - this.originalY) * this.props.verticalDirection;
        if (this.props.horizontal && this.props.onNewWidth)
            this.props.onNewWidth(widthOffset);
        else if (this.props.vertical && this.props.onNewHeight)
            this.props.onNewWidth(heightOffset);
    }

}

ResizeBar.defaultProps = {
    horizontalDirection: 1,
    verticalDirection: 1
};

export default Resizable;
