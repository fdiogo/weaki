import Command from './command';
import weaki from '../../app';

class RendererDelegateCommand extends Command {

    constructor (commandSelector, args) {
        super(delegate.bind(null, commandSelector, args), null);
    }

}

function delegate (selector, args) {
    weaki.mainWindow.webContents.send(selector, args);
}

export default RendererDelegateCommand;
