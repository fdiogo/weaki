import RendererDelegateCommand from './renderer-delegate-command';

class BoldCommand extends RendererDelegateCommand {

    constructor () {
        super('editor:bold');
    }

}

export default BoldCommand;
