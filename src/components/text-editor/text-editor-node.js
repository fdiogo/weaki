import React from 'react';

class TextEditorNode {

    constructor (start, end, elementType, props = {}) {
        this.start = start;
        this.end = end;
        this.elementType = elementType;
        this.breakable = elementType.breakable;
        this.props = props;
        this.children = [];
    }

    tryInsert (node) {
        if (node.start < this.start || node.end > this.end)
            return false;

        for (let child of this.children) {
            if (child.tryInsert(node))
                return true;
        }

        if (this.children.length === 0) {
            this.children.push(node);
            return true;
        }

        const nodesToRemove = [];
        let insertIndex = this.children.length;
        for (let index = 0; index < this.children.length; index++) {
            const child = this.children[index];
            if (node.start <= child.start && node.end <= child.start) {
                insertIndex = index;
                break;
            }

            if (child.start >= node.start && child.end <= node.end) {
                if (!node.tryInsert(child))
                    return false;

                nodesToRemove.push(index);
            } else if (child.start >= node.start && child.end > node.end) {
                if (node.breakable) {
                    const beforeChild = new TextEditorNode(node.start, child.start, node.elementType, node.props);
                    const insideChild = new TextEditorNode(child.start, node.end, node.elementType, node.props);

                    const inserted = child.tryInsert(insideChild);
                    if (!inserted)
                        return false;

                    for (let orphan; (orphan = node.children.pop()) !== undefined;)
                        insideChild.tryInsert(orphan) || beforeChild.tryInsert(orphan);

                    insertIndex = index;
                    node = beforeChild;
                    break;
                }
            } else if (child.start < node.start && child.end > node.start && child.end < node.end) {
                if (node.breakable) {
                    const insideChild = new TextEditorNode(node.start, child.end, node.elementType, node.props);
                    const afterChild = new TextEditorNode(child.end, node.end, node.elementType, node.props);

                    const inserted = child.tryInsert(insideChild);
                    if (!inserted)
                        return false;

                    for (let orphan; (orphan = node.children.pop()) !== undefined;)
                        insideChild.tryInsert(orphan) || afterChild.tryInsert(orphan);

                    insertIndex = index + 1;
                    node = afterChild;
                }
            }
        }

        let removedCount = 0;
        for (let index of nodesToRemove) {
            this.children.splice(index - removedCount, 1);
            removedCount += 1;
        }

        if (insertIndex !== -1) {
            nodesToRemove.forEach(index => {
                if (index < insertIndex)
                    insertIndex -= 1;
            });
            this.children.splice(insertIndex, 0, node);
        }

        return true;
    }

    render (allText) {
        const elements = [];

        let textIndex = this.start;
        for (let child of this.children) {
            const textBefore = allText.substring(textIndex, child.start);
            elements.push(<span data-start={textIndex} data-end={textIndex + textBefore.length}>{textBefore}</span>);
            elements.push(child.render(allText));
            textIndex = child.end;
        }

        if (textIndex < this.end) {
            const remainingText = allText.substring(textIndex, this.end);
            elements.push(<span data-start={textIndex} data-end={this.end}>{remainingText}</span>);
        }

        return React.createElement(this.elementType, this.props, ...elements);
    }
}

export default TextEditorNode;
