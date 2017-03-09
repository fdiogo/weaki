import RendererDelegateCommand from './renderer-delegate-command';

class StrikeThroughCommand extends RendererDelegateCommand {

    constructor () {
        super('editor:strike-through');
    }

}

export default StrikeThroughCommand;
