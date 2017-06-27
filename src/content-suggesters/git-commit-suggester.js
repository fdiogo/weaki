import { remote, ipcRenderer } from 'electron';

const weaki = remote.getGlobal('instance');
const regex = /#(\w*)/;

const LATEST_COMMITS_COUNT = 5;

class GitCommitSuggester {

    static commitToSuggestion (commit) {
        const smallHash = commit.hash.substring(0, 5);
        return {
            icon: 'octicon-white octicon-git-branch',
            data: smallHash,
            text: `${smallHash} ${commit.message}`
        };
    }

    constructor () {
        this.commits = [];

        const updateCommits = () => weaki.git.getCommits().then(commits => this.commits = commits);
        ipcRenderer.on('application:workspace-changed', updateCommits);
        updateCommits();
    }

    getSuggestions (textDescriptor, editor) {
        const suggestions = [];
        const match = regex.exec(textDescriptor.currentWord.text);

        if (!match || textDescriptor.selection.end <= match.index + textDescriptor.currentWord.start)
            return suggestions;

        const inputHash = match[1];
        if (inputHash.length === 0) {
            const latestCommits = this.commits.all.slice(0, LATEST_COMMITS_COUNT)
                .map(GitCommitSuggester.commitToSuggestion)
                .map(suggestion => {
                    const start = textDescriptor.currentWord.start + match.index + 1;
                    const end = start + inputHash.length;
                    suggestion.action = () => editor.replaceRange(start, end, suggestion.data);
                    return suggestion;
                });

            suggestions.push(...latestCommits);
            return suggestions;
        }

        for (let commit of this.commits.all) {
            const smallHash = commit.hash.substring(0, 5);
            if (smallHash === inputHash || smallHash.indexOf(inputHash) !== 0)
                continue;

            const suggestion = GitCommitSuggester.commitToSuggestion(commit);
            const start = textDescriptor.currentWord.start + match.index + 1;
            const end = start + inputHash.length;
            suggestion.action = () => editor.replaceRange(start, end, smallHash);
            suggestions.push(suggestion);
        }

        return suggestions;
    }

};

export default GitCommitSuggester;
