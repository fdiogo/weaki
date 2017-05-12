import { remote } from 'electron';

const weaki = remote.getGlobal('instance');

class FileCrawler {

    constructor (filePath, commitHash) {
        this.filePath = filePath;
        this.commitHash = commitHash;
        this.content = null;
    }

    load () {
        if (!this.commitHash) {
            return weaki.fileManager.readFile(this.filePath)
                .then(content => this.content = content);
        } else {
            return weaki.git.getFileVersion(this.filePath, this.commitHash)
                .then(content => this.content = content);
        }
    }

    getSection (name) {
        return null;
    }

}

export default FileCrawler;
