import { remote } from 'electron';
import React from 'react';

const PropTypes = {
    filePath: React.PropTypes.string
};

const weaki = remote.getGlobal('instance');
class FileHistory extends React.Component {

    static get propTypes () {
        return PropTypes;
    }

    constructor (props) {
        super(props);
        this.state = {
            commits: {
                all: [],
                latest: null,
                total: 0
            }
        };

        if (props.file.path) {
            weaki.git.getCommitsForFile(props.file.path)
                    .then((commits) => this.setState({ commits: commits }));
        }
    }

    componentWillReceiveProps (nextProps) {
        if (nextProps.file.path) {
            weaki.git.getCommitsForFile(nextProps.file.path)
                    .then((commits) => this.setState({ commits: commits }));
        }
    }

    onCommitClick (commit) {
        weaki.executeCommand('git:checkout', commit.hash, this.props.file.path);
    }

    render () {
        const commitItems = [];
        for (let commit of this.state.commits.all) {
            commitItems.push(<FileHistoryCommit {...commit}
                key={commit.hash}
                onClick={this.onCommitClick.bind(this, commit)}>
            </FileHistoryCommit>);
        }

        return <ul className='file-history'>
            <h2 className='file-history-title'>File History</h2>
            {commitItems}
        </ul>;
    }

}

class FileHistoryCommit extends React.Component {

    render () {
        return <li key={this.props.hash}
            className="file-history-commit"
            onClick={this.props.onClick}>
            <div className="file-history-commit-header">
                <span className="file-history-commit-hash">
                    {this.props.hash.substring(0, 7)}
                </span>
            </div>
            {this.props.message}
        </li>;
    }

}

export default FileHistory;
