import Command from './command';

class RendererDelegateCommand extends Command {

    constructor (commandSelector, args) {
        super(delegate.bind(null, commandSelector, args), null);
    }

}

function delegate (selector, args) {
    global.mainWindow.webContents.send(selector, args);
}

export default RendererDelegateCommand;
