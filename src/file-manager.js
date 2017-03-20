import chokidar from 'chokidar';
import bluebird from 'bluebird';
import fs from 'fs';

class FileManager {

    constructor () {
        this.fileSaves = {};
        this.changeListeners = {};
        this.externalChangeListeners = {};
        this.watcher = chokidar.watch();
        this.watcher.on('change', this.onFileChange.bind(this));
    }

    /**
     * Reads the content of a file.
     * @param {string} filePath - The path of the file.
     * @returns {Promise.<String, Error>} - A promise to the content of the file.
     */
    readFile (filePath) {
        return new Promise(function (resolve, reject) {
            fs.readFile(filePath, 'utf8', (err, data) => {
                if (err) reject(new Error(err));
                else resolve(data);
            });
        });
    }

    /**
     * Writes new content to a file.
     * @param {string} filePath - The path of file.
     * @param {string} content - The content to be written.
     * @returns {Promise.<,Error>} A promise to the operation.
     */
    writeFile (filePath, content) {
        if (!this.fileSaves[filePath])
            this.fileSaves[filePath] = [];

        const saveOperation = new Promise((resolve, reject) => {
            fs.writeFile(filePath, content, error => {
                if (error) {
                    const index = this.fileSaves[filePath].indexOf(saveOperation);
                    this.fileSaves[filePath].splice(index, 1);
                    reject(new Error(error));
                } else
                    resolve();

                saveOperation.pending = false;
            });
        });

        this.fileSaves[filePath].push(saveOperation);
        return saveOperation;
    }

    /**
     * Registers a listener for when a file is changed.
     * @param {string} filePath - The path of the file.
     * @param {function} callback - The function to be called when the event triggers.
     * @param {boolean} [externalOnly=false] - Whether or not to skip notifications when the file was changed
     *                                         via {@link FileManager.writeFile}.
     * @returns {Object} - The listener handler.
     */
    watchFileChange (filePath, callback, externalOnly = false) {
        let listeners = externalOnly ? this.externalChangeListeners : this.changeListeners;

        if (!listeners[filePath]) {
            listeners[filePath] = [callback];
            this.watcher.add(filePath);
        } else
            listeners[filePath].push(callback);

        return callback;
    }

    /**
     * Calls the respective listeners for the 'change' event on a file.
     * @param {string} filePath - The changed file.
     */
    onFileChange (filePath) {
        const saveOperations = this.fileSaves[filePath];
        if (this.externalChangeListeners[filePath] && saveOperations) {
            bluebird.Promise.some(saveOperations, 1)
                .then(promise => {
                    const index = saveOperations.indexOf(promise);
                    saveOperations.splice(index, 1);
                    console.log('Detected internal change!');
                })
                .catch(() => {
                    console.log('Detected external change!');
                    this.externalChangeListeners[filePath].forEach(cb => cb());
                });
        }

        if (this.changeListeners[filePath])
            this.changeListeners[filePath].forEach(cb => cb());
    }
}

export default FileManager;
