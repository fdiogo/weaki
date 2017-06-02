import { remote, ipcRenderer } from 'electron';

const weaki = remote.getGlobal('instance');
const regex = /#(\w*)/;

const LATEST_COMMITS_COUNT = 5;

class GitCommitSuggestor {

    static commitToSuggestion (commit) {
        const smallHash = commit.hash.substring(commit.hash.length - 1 - 5);
        return {
            type: 0,
            text: `${smallHash} ${commit.message}`
        };
    }

    constructor () {
        this.commits = [];

        const updateCommits = () => weaki.git.getCommits().then(commits => this.commits = commits);
        ipcRenderer.on('application:workspace-changed', updateCommits);
        updateCommits();
    }

    getSuggestions (textDescriptor) {
        const suggestions = [];
        const match = regex.exec(textDescriptor.currentWord.text);

        if (!match)
            return suggestions;

        const inputHash = match[1];
        if (inputHash.length === 0) {
            const latestCommits = this.commits.all.slice(0, LATEST_COMMITS_COUNT).map(GitCommitSuggestor.commitToSuggestion);
            suggestions.push(...latestCommits);
            return suggestions;
        }

        for (let commit of this.commits.all) {
            const smallHash = commit.hash.substring(commit.hash.length - 1 - 5);
            if (smallHash.indexOf(inputHash) !== 0)
                continue;

            suggestions.push(GitCommitSuggestor.commitToSuggestion(commit));
        }

        return suggestions;
    }

};

export default GitCommitSuggestor;
