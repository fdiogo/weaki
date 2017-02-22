import {app, dialog} from 'electron';
import fs from 'fs';
import Command from './command';

class OpenFileCommand extends Command {
    constructor (filePath) {
        super(openFile.bind(null, filePath), null);
    }
}

function openFile (filePath) {
    if (!filePath) {
        return getFilePath()
                .then(readFile)
                .then(send);
    } else {
        return readFile(filePath)
                .then(send);
    }
}

function getFilePath () {
    return new Promise(function (resolve, reject) {
        dialog.showOpenDialog({
            title: 'Open File',
            defaultPath: app.getPath('desktop')
        }, files => {
            if (files === undefined)
                reject('No file was selected!');
            else if (files.length !== 1)
                reject('You can only select one file!');
            else
                resolve(files[0]);
        });
    });
}

function readFile (filePath) {
    return new Promise(function (resolve, reject) {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) reject(err);
            else resolve({filePath: filePath, contents: data});
        });
    });
}

function send (file) {
    return new Promise(resolve => {
        global.mainWindow.webContents.send('editor:file-loaded', file);
        resolve();
    });
}

export default OpenFileCommand;
