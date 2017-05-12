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
        const filename = match[1];
        const section = match[2];
        const commit = match[3];
        if (!section)
            return null;

        const popupElement = document.createElement('code');
        popupElement.style.display = 'none';

        let crawler = null;
        switch (path.extname(filename)) {
            case '.js':
            case '.jsx':
                crawler = new JavascriptCrawler(filename, commit);
                break;
            default:
                crawler = new JavascriptCrawler(filename, commit);
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

ReferenceDecorator.regex = /\[([^\]@]*)(?:@([^\]#]*))?(?:#([A-Za-z0-9~^]*))?\]/g;
export default ReferenceDecorator;
