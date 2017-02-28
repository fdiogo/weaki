export default (function (markup) {
    if (typeof document !== 'undefined') return;

    let jsdom = require('jsdom').jsdom;

    global.document = jsdom(markup || '');
    global.window = document.defaultView;
    global.navigator = {
        userAgent: 'node.js'
    };
})('<html><body></body></html>');
