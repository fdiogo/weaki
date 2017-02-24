import RendererDelegateCommand from './renderer-delegate-command';

class ItalicCommand extends RendererDelegateCommand {

    constructor () {
        super('editor:italic');
    }

}

export default ItalicCommand;
