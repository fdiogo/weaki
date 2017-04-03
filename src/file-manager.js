import chokidar from 'chokidar';
import bluebird from 'bluebird';
import path from 'path';
import fs from 'fs';
import rimraf from 'rimraf';

/**
 * Manages the file system with the node module 'fs' and others.
 * @class FileManager
 */
class FileManager {

    constructor () {
        this.fileSaves = {};
        this.changeListeners = {};
        this.watcher = chokidar.watch([], { persistent: false });

        // On linux the watcher seems to stop working once there's a 'rename' event.
        // This temporary fix seems to work.
        if (process.platform !== 'win32') {
            this.watcher.on('raw', (event, path, {watchedPath}) => {
                if (event === 'rename') {
                    this.watcher.unwatch(watchedPath);
                    if (this.changeListeners[watchedPath])
                        this.watcher.add(watchedPath);
                }
            });
        }

        this.watcher.on('add', this.onFileAdd.bind(this));
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
            fs.readdir(directory, (err, files) => {
                if (err) {
                    console.log(`Could not read ${directory}`);
                    reject(new Error(err));
                } else
                    resolve(files);
            });
        }).then(files => {
            const statsPromises = files.map(file => path.join(directory, file))
                                        .map(file => this.getStats(file));
            return Promise.all(statsPromises);
        });

        if (recursive) {
            return readdir.then(files => {
                const directories = files.filter(file => file.isDirectory());
                const promises = directories.map(dir => this.readDirectory(dir.path, true));
                return Promise.all(promises)
                    .then(subDirectories => files.concat(...subDirectories));
            });
        }

        return readdir;
    }

    /**
     * Removes a directory with a recursive option.
     * @param {string} directory - The directory to be removed.
     * @param {boolean} recursive - If the operation should be recursive.
     * @returns {Promise.<void,Error>} A promise to the operation.
     */
    removeDirectory (directory, recursive) {
        return new Promise(function (resolve, reject) {
            const remove = recursive ? rimraf : fs.rmdir;
            remove(directory, err => {
                if (err) reject(new Error(err));
                else resolve();
            });
        });
    }

    /**
     * Creates a unique temporary directory with a prefix.
     * @param {string} prefix - The prefix of the folder name.
     * @returns {Promise.<String, Error>} - A promise to the generated folder name.
     */
    makeTemporaryDirectory (prefix) {
        return new Promise((resolve, reject) => {
            fs.mkdtemp(prefix, (err, folderName) => {
                if (err) reject(new Error(err));
                else resolve(folderName);
            });
        });
    }

    /**
     * Obtains the [stat]{@link https://nodejs.org/api/fs.html#fs_class_fs_stats} object at path.
     * Includes the property 'path' on the object.
     * @param {string} path - The path of the object.
     * @returns {Promise.<Object, Error>} A promise to the stats of the object at path.
     */
    getStats (path) {
        return new Promise(function (resolve, reject) {
            fs.stat(path, function (error, stat) {
                if (error) {
                    console.log(error);
                    reject(new Error(error));
                } else {
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
     * @returns {Promise.<void,Error>} A promise to the operation.
     */
    writeFile (filePath, content) {
        if (!this.fileSaves[filePath])
            this.fileSaves[filePath] = new Set();

        const promise = new Promise((resolve, reject) => {
            fs.writeFile(filePath, content, error => {
                if (error)
                    reject(new Error(error));
                else
                    resolve();
            });
        });

        const operation = { promise: promise.then(() => operation, () => operation) };

        this.fileSaves[filePath].add(operation);
        return promise;
    }

    /**
     * Creates a new file only if it doesn't exist already.
     * @param {string} filePath - The path of the file.
     * @param {string} [content = ''] - The initial content of the file.
     * @returns {Promise.<void,Error>} A promise to the operation.
     */
    createFile (filePath, content = '') {
        return this.exists(filePath)
            .then(exists => new Promise(function (resolve, reject) {
                if (exists)
                    reject(new Error('The file already exists!'));
                else {
                    fs.appendFile(filePath, content, err => {
                        if (err)
                            reject(new Error(err));
                        else
                            resolve();
                    });
                }
            }));
    }

    /**
     * Checks for the existance of an object at a specific path.
     * @param {string} path - The path of the object.
     * @returns {Promise.<Boolean>} A promise to the answer.
     */
    exists (path) {
        return new Promise(function (resolve, reject) {
            fs.access(path, err => {
                if (err) resolve(false);
                else resolve(true);
            });
        });
    }

    /**
     * Callback called when the content of file is changed.
     * @callback fileChangeCallback
     * @param {string} path - The path of the file.
     * @param {boolean} isExternal - Whether the change was external to this manager instance or not.
     */

    /**
     * @param {string} filePath - The path of the file.
     * @param {fileChangeCallback} callback - The function to be called when the event triggers.
     * @returns {Object} - The listener handler.
     */
    watchFileChange (filePath, callback) {
        if (!this.changeListeners[filePath]) {
            this.changeListeners[filePath] = new Set();
            this.fileSaves[filePath] = new Set();
            this.watcher.add(filePath);
        }

        this.changeListeners[filePath].add(callback);
        return callback;
    }

    /**
     * @param {func} callback - The function to be called when the event triggers.
     * @returns {Object} The listener handler.
     */
    watchFileAdd (directory, callback) {
        if (!this.addListeners)
            this.addListeners = new Set();

        const handle = { root: directory, callback: callback };
        this.addListeners.add(handle);
        this.watcher.add(directory);

        return handle;
    }

    /**
     * Removes the listener for changes on a file.
     * @param {string} filePath - The path of the file.
     * @param {Object} handle - The object returned by {@link FileManager.watchFileChange}
     */
    unwatchFileChange (filePath, handle) {
        const listeners = this.changeListeners[filePath];
        if (!listeners || listeners.has(handle) === false)
            return;

        listeners.delete(handle);
        if (listeners.size === 0) {
            delete this.changeListeners[filePath];
            delete this.fileSaves[filePath];
            this.watcher.unwatch(filePath);
        }
    }

    /**
     * When a file's content is changed.
     *
     * @event application:file-changed
     * @param {string} path - The path of the file.
     * @param {boolean} isExternal - Whether or not the change was made through the same {@link FileManager}
     *                               that fired the event.
     */

    /**
     * Calls the respective listeners for the 'change' event on a file.
     * @param {string} filePath - The changed file.
     * @fires application:file-changed
     */
    onFileChange (filePath) {
        if (!this.changeListeners[filePath])
            return;

        const saveOperations = this.fileSaves[filePath];
        if (saveOperations.size === 0) {
            console.log('Detected external change!');
            this.changeListeners[filePath].forEach(cb => cb(filePath, true));
            return;
        }

        bluebird.Promise.any(Array.from(saveOperations).map(op => op.promise))
            .then(operation => {
                saveOperations.delete(operation);
                console.log('Detected internal change!');
                this.changeListeners[filePath].forEach(cb => cb(filePath, false));
            })
            .catch(operation => {
                saveOperations.delete(operation);
                console.log('Detected external change!');
                this.changeListeners[filePath].forEach(cb => cb(filePath, true));
            });
    }

    onFileAdd (filePath) {
        if (!this.addListeners)
            return;

        this.addListeners.forEach(listener => {
            if (filePath.indexOf(listener.root) === 0)
                listener.callback(filePath);
        });
    }
}

export default FileManager;
