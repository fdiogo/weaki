/* eslint-env browser */
import path from 'path';
import highlight from 'highlight.js';
import Decorator from './decorator';

import JavascriptCrawler from '../crawlers/javascript-crawler';

class ReferenceDecorator extends Decorator {

    static getClass (match) {
        return 'reference';
    }

    static getPopup (match) {
        const section = match[2];
        if (!section)
            return null;

        const popupElement = document.createElement('code');
        popupElement.style.display = 'none';

        const filename = match[1];
        let base = null;

        const baseElements = document.getElementsByTagName('base');
        if (baseElements.length > 0)
            base = baseElements[0].href.replace('file://', '');

        let filePath = path.isAbsolute(filename) || !base ? filename : path.join(base, filename);
        let crawler = null;
        switch (path.extname(filePath)) {
            case '.js':
            case '.jsx':
                crawler = new JavascriptCrawler(filePath);
                break;
            default:
                crawler = new JavascriptCrawler(filePath);
        }

        crawler.load()
            .then(function () {
                const code = crawler.getSection(section);
                if (!code)
                    return;

                const highlightedCode = highlight.highlight('javascript', code).value;
                popupElement.innerHTML = highlightedCode;
                popupElement.style.display = 'initial';
            });

        return popupElement;
    }
}

ReferenceDecorator.regex = /\[([^\]@]*)(?:@([^\]]*))?\]/g;
export default ReferenceDecorator;
