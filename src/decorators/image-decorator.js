/* eslint-env browser */
import Decorator from './decorator';

class ImageDecorator extends Decorator {

    static getClass (match) {
        return 'image-link';
    }

    static getPopup (match) {
        const reference = match[2];
        const img = new Image();
        img.style.display = 'none';
        img.src = reference;
        img.onload = () => img.style.display = 'initial';

        return img;
    }
}

ImageDecorator.regex = /!\[([^\]]*)\]\(([^)]*)\)/g;
export default ImageDecorator;
