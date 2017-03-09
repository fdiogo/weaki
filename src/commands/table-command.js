import RendererDelegateCommand from './renderer-delegate-command';

class TableCommand extends RendererDelegateCommand {

    constructor () {
        super('editor:table');
    }

}

export default TableCommand;
