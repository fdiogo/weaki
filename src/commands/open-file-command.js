import {app, dialog} from 'electron';
import Command from './command';
import weaki from '../../app';

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
    return weaki.fileManager.readFile(filePath)
                .then(content => ({path: filePath, content: content}));
}

function send (file) {
    return Promise.resolve(weaki.mainWindow.webContents.send('application:file-loaded', file.path, file.content));
}

export default OpenFileCommand;
