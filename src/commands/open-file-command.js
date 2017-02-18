import {app, dialog} from 'electron';
import fs from 'fs';
import Command from './command';

class OpenFileCommand extends Command {
    constructor () {
        super(openFile, openFile);
    }
}

function openFile () {
    console.log('heyo ' + app.mainWindow);

    dialog.showOpenDialog({
        title: 'Open File',
        defaultPath: app.getPath('desktop')
    }, files => {
        if (files === undefined || files.length !== 1)
            return;

        const filePath = files[0];
        return fs.readFile(filePath, 'utf8', console.log);
    });
}

export default OpenFileCommand;
