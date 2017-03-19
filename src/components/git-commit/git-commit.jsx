import React from 'react';
import { remote } from 'electron';

const weaki = remote.getGlobal('instance');
const updateStatus = function () {
    weaki.git.status()
        .then(status => { console.log(status); this.setState(status); })
        .catch(error => this.setState({error: error}));
};

class GitCommit extends React.Component {

    static fileToItem (prepend, file) {
        return <li key={file}>{prepend} {file}</li>;
    }

    constructor (props) {
        super(props);
        this.state = {
            conflicted: [],
            created: [],
            deleted: [],
            modified: [],
            not_added: [],
            files: [],
            renamed: [],
            message: 'Updated wiki',
            disabled: false
        };

        updateStatus.call(this);
    }

    constructorWillReceiveProps (nextProps) {
        updateStatus.call(this);
    }

    commit () {
        this.setState({disabled: true});

        if (!this.state.message || this.state.message === '') {
            remote.dialog.showErrorBox('Missing message', 'A message is required to commit!');
            this.messageInput.focus();
            return;
        }

        if (this.state.files.length === 0) {
            remote.dialog.showErrorBox('No file changes', 'Can\'t commit if there are no changes to the repository!');
            return;
        }

        const messageLines = this.state.message.split('\n').map(line => line.trim());
        console.log(messageLines);
        weaki.git.add('./*')
                .then(() => weaki.git.commit(messageLines))
                .then(() => {
                    updateStatus.call(this);
                    this.setState({message: ''});
                })
                .catch(error => remote.dialog.showErrorBox('Commit error', error.message))
                .then(() => this.setState({disabled: false}));
    }

    render () {
        if (this.state.error) {
            return <div className='git-commit-panel'>
                <h1>Commit</h1>
                <p>No open repository.</p>
            </div>;
        }

        let files = [];
        this.state.created.concat(this.state.not_added)
                            .map(GitCommit.fileToItem.bind(null, '+'))
                            .forEach(file => files.push(file));

        this.state.deleted.map(GitCommit.fileToItem.bind(null, '-'))
                            .forEach(file => files.push(file));

        this.state.modified.map(GitCommit.fileToItem.bind(null, 'M'))
                            .forEach(file => files.push(file));

        this.state.renamed.map(GitCommit.fileToItem.bind(null, 'R'))
                            .forEach(file => files.push(file));

        return <div className='git-commit-panel'>
            <h1>Commit</h1>
            <h3>Files</h3>
            <ul className="git-commit-files">
                {files.length > 0 ? files : <p>No file changes</p>}
            </ul>
            <h3>Message</h3>
            <textarea className="git-commit-message"
                ref={messageInput => this.messageInput = messageInput}
                value={this.state.message}
                onChange={event => this.setState({message: event.target.value})}>
            </textarea>
            <div className="git-commit-buttons">
                <span className="button" onClick={this.commit.bind(this)} disabled={this.state.disabled}>Commit</span>
            </div>
        </div>;
    }

};

export default GitCommit;
