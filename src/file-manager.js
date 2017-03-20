import chokidar from 'chokidar';
import bluebird from 'bluebird';
import path from 'path';
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
     * Reads the files and folders on a directory.
     * @param {string} directory - The directory to read.
     * @param {boolean} recursive - Whether or not to include files in subfolders.
     * @returns {Promise<Object[], Error>} A promise to the stats of the files.
     */
    readDirectory (directory, recursive) {
        const readdir = new Promise((resolve, reject) => {
            fs.readdir(directory, 'utf8', (err, files) => {
                if (err) reject(new Error(err));
                else resolve(files);
            });
        }).then(files => {
            const statsPromises = files.map(file => path.join(directory, file))
                                        .map(file => this.getStats(file));
            return Promise.all(statsPromises);
        });

        if (recursive) {
            readdir.then(files => {
                const directories = files.filter(file => file.isDirectory());
                const promises = directories.map(dir => this.readDirectory(dir.path));
                Promise.all(promises)
                        .then(subDirectories => files.concat(subDirectories));
            });
        }

        return readdir;
    }

    /**
     * Obtains the [stat]{@link https://nodejs.org/api/fs.html#fs_class_fs_stats} object at path.
     * Includes the property 'path' on the object.
     * @param {string} path - The path of the object.
     * @returns {Promise.<Object, Error>} The stats of the object at path.
     */
    getStats (path) {
        return new Promise(function (resolve, reject) {
            fs.stat(path, function (error, stat) {
                if (error) throw new Error(error);
                else {
                    stat.path = path;
                    resolve(stat);
                }
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
