import RendererDelegateCommand from './renderer-delegate-command';

class LinkCommand extends RendererDelegateCommand {

    constructor () {
        super('editor:link');
    }

}

export default LinkCommand;
