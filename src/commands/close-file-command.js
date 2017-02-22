import Command from './command';

class CloseFileCommand extends Command {

    constructor (filePath) {
        super(closeFile.bind(null, filePath));
    }

}

function closeFile (filePath) {
    global.mainWindow.webContents.send('editor:close-file', filePath);
}

export default CloseFileCommand;
