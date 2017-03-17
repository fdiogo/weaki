import Command from './command';
import weaki from '../../app';

class CloseFileCommand extends Command {

    constructor (filePath) {
        super(closeFile.bind(null, filePath));
    }

}

function closeFile (filePath) {
    weaki.mainWindow.webContents.send('editor:close-file', filePath);
}

export default CloseFileCommand;
