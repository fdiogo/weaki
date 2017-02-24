import RendererDelegateCommand from './renderer-delegate-command';

class UnorderedListCommand extends RendererDelegateCommand {

    constructor () {
        super('editor:unordered-list');
    }

}

export default UnorderedListCommand;
