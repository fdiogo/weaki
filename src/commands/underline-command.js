import RendererDelegateCommand from './renderer-delegate-command';

class UnderlineCommand extends RendererDelegateCommand {

    constructor () {
        super('editor:underline');
    }

}

export default UnderlineCommand;
