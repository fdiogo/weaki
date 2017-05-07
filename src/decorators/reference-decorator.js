/* eslint-env browser */
import Decorator from './decorator';

class ReferenceDecorator extends Decorator {

    static getClass (match) {
        return 'reference';
    }

    static getPopup (match) {
        const reference = match[1];
        const img = new Image();
        img.style.display = 'none';
        img.src = reference;
        img.onload = () => img.style.display = 'inline';

        return img;
    }
}

ReferenceDecorator.regex = /\[(.*)\]/g;
export default ReferenceDecorator;
