import RendererDelegateCommand from './renderer-delegate-command';

class BlockquoteCommand extends RendererDelegateCommand {

    constructor () {
        super('editor:blockquote');
    }

}

export default BlockquoteCommand;
