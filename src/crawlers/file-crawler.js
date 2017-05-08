import { remote } from 'electron';

const weaki = remote.getGlobal('instance');

class FileCrawler {

    constructor (filePath) {
        this.filePath = filePath;
        this.content = null;
    }

    load () {
        return weaki.fileManager.readFile(this.filePath)
                                .then(content => this.content = content);
    }

    getSection (name) {
        return null;
    }

}

export default FileCrawler;
