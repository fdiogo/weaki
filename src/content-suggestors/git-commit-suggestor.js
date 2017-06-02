import { remote, ipcRenderer } from 'electron';

const weaki = remote.getGlobal('instance');
const regex = /#(\w+)\b/;

class GitCommitSuggestor {

    constructor () {
        this.commits = [];

        const updateCommits = () => weaki.git.getCommits().then(commits => this.commits = commits.all);
        ipcRenderer.on('application:workspace-changed', updateCommits);
        updateCommits();
    }

    getSuggestions (textDescriptor) {
        const suggestions = [];
        const match = regex.exec(textDescriptor.currentWord.text);

        if (!match || !match[1])
            return suggestions;

        const inputHash = match[1];
        for (let commit of this.commits) {
            const smallHash = commit.hash.substring(commit.hash.length - 1 - 5);
            if (smallHash.indexOf(inputHash) !== 0)
                continue;

            suggestions.push({
                type: 0,
                text: `${smallHash} ${commit.message}`
            });
        }

        return suggestions;
    }

};

export default GitCommitSuggestor;
