import Command from './command';
import weaki from '../../app';

class NewFileCommand extends Command {
    constructor (filePath) {
        super(newFile.bind(null));
    }
}

function newFile () {
    weaki.mainWindow.webContents.send('application:new-file');
}

export default NewFileCommand;
