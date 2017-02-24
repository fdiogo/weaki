import RendererDelegateCommand from './renderer-delegate-command';

class OrderedListCommand extends RendererDelegateCommand {

    constructor () {
        super('editor:ordered-list');
    }

}

export default OrderedListCommand;
