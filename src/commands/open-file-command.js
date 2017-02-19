import {app, dialog} from 'electron';
import fs from 'fs';
import Command from './command';

class OpenFileCommand extends Command {
    constructor () {
        super(openFile, null);
    }
}

function openFile () {
    dialog.showOpenDialog({
        title: 'Open File',
        defaultPath: app.getPath('desktop')
    }, files => {
        if (files === undefined || files.length !== 1)
            return;

        const filePath = files[0];
        return fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                console.log(err);
                return;
            }

            global.mainWindow.webContents.send('editor:file-loaded', {
                filePath: filePath,
                contents: data
            });
        });
    });
}

export default OpenFileCommand;
