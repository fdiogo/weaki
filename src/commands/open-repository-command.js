import {app, dialog} from 'electron';
import path from 'path';
import fs from 'fs';
import Command from './command';
import weaki from '../../app.js';

/**
 * Opens a git repository in the application.
 *
 * The command first opens a dialog window so the user can select a directory which must
 * be a git repository (checked with the existance of a .git folder).
 * When a valid repository is selected, the directory is loaded and a file tree is created.
 * Finally, this file tree is sent to the main window through the {@link application:directory-loaded} channel.
 *
 * @class OpenRepositoryCommand
 */
class OpenRepositoryCommand extends Command {
    constructor (directory) {
        super(openRepository.bind(null, directory), null);
    }
}

/**
 * Opens a git repository and sends the contents to the main window.
 * @param {string} [directory]  - The path of the repository.
 * @returns {Promise}           - A promise to the operation.
 */
function openRepository (directory) {
    if (!directory) {
        return getDirectory()
                .then(readDirectory)
                .then(send);
    } else {
        return readDirectory(directory)
                .then(send);
    }
}

/**
 *
 */
function getDirectory () {
    return new Promise(function (resolve, reject) {
        dialog.showOpenDialog(global.mainWindow, {
            title: 'Open Repository',
            defaultPath: app.getPath('desktop'),
            properties: ['openDirectory']
        }, function (directories) {
            const directory = directories[0];
            weaki.openRepository(directory)
                .then(
                    () => resolve(directory), 
                    () => {
                        dialog.showErrorBox('Error', 'This directory is not git repository!');
                        getDirectory().then(resolve, reject);
                    }
                );
        });
    });
}

function readDirectory (directory) {
    return new Promise(function (resolve, reject) {
        fs.readdir(directory, 'utf8', (err, files) => {
            if (err) reject(err);
            const descriptorPromises = files.map(fileName => path.join(directory, fileName))
                                            .concat([directory])
                                            .map(filePath => getFileDescriptor(filePath));

            Promise.all(descriptorPromises).then(files => {
                resolve({
                    directory: directory,
                    files: files
                });
            }, reject);
        });
    });
}

function getFileDescriptor (filePath) {
    return new Promise(function (resolve, reject) {
        fs.stat(filePath, function (err, stats) {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                resolve({
                    path: filePath,
                    isDirectory: stats.isDirectory()
                });
            }
        });
    });
}

function send (descriptor) {
    return new Promise(resolve => {
        global.mainWindow.webContents.send('application:directory-loaded', descriptor);
        resolve();
    });
}

export default OpenRepositoryCommand;
