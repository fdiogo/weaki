import RendererDelegateCommand from './renderer-delegate-command';

class HeaderCommand extends RendererDelegateCommand {

    constructor (level) {
        super('editor:header', level);
    }

}

export default HeaderCommand;
