import RendererDelegateCommand from './renderer-delegate-command';

class CodeCommand extends RendererDelegateCommand {

    constructor () {
        super('editor:code');
    }

}

export default CodeCommand;
