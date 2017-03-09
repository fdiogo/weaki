import RendererDelegateCommand from './renderer-delegate-command';

class ImageCommand extends RendererDelegateCommand {

    constructor () {
        super('editor:image');
    }

}

export default ImageCommand;
