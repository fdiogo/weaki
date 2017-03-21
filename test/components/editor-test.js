import '../dom-mock';
import React from 'react'; // eslint-disable-line
import { expect } from 'chai';
import Editor from '../../src/components/editor/editor';
import TestUtils from 'react-addons-test-utils';
import jsdom from 'mocha-jsdom';

global.Node = {
    TEXT_NODE: 3
};

describe('Editor', function () {
    jsdom({ skipWindowCheck: true });

    describe('.constructor()', function () {
        it('no text selected', function () {
            const editor = TestUtils.renderIntoDocument(<Editor/>);
            expect(editor.isTextSelected()).to.be.false;
        });
    });

    describe('#replaceText', function () {
        it('replace all text', function () {
            const editor = TestUtils.renderIntoDocument(<Editor/>);
            editor.insertWrapper('hello');
            editor.replaceText('bye');
            expect(editor.getCurrentText()).to.equal('bye');
        });
    });

    describe('#isTextSelected()', function () {
        it('return false on start', function () {
            const editor = TestUtils.renderIntoDocument(<Editor/>);
            const isSelected = editor.isTextSelected();

            expect(isSelected).to.be.false;
        });
    });

    describe('#bold()', function () {
        it('surround text if selected', function () {
            const editor = TestUtils.renderIntoDocument(<Editor/>);
            editor.insertWrapper('hello');
            editor.selectText();
            editor.bold();

            const text = editor.getCurrentText();
            expect(text).to.equal('**hello**');
        });

        it('append at carret if no text is selected', function () {
            const editor = TestUtils.renderIntoDocument(<Editor/>);
            editor.insertWrapper('hello');
            editor.bold();

            const text = editor.getCurrentText();
            expect(text).to.equal('hello****');
        });
    });

    describe('#italic()', function () {
        it('surround text if selected', function () {
            const editor = TestUtils.renderIntoDocument(<Editor/>);
            editor.insertWrapper('hello');
            editor.selectText();
            editor.italic();

            const text = editor.getCurrentText();
            expect(text).to.equal('_hello_');
        });

        it('append at carret if no text is selected', function () {
            const editor = TestUtils.renderIntoDocument(<Editor/>);
            editor.insertWrapper('hello');
            editor.italic();

            const text = editor.getCurrentText();
            expect(text).to.equal('hello__');
        });
    });

    describe('.underline()', function () {
        it('surround text if selected', function () {
            const editor = TestUtils.renderIntoDocument(<Editor/>);
            editor.insertWrapper('hello');
            editor.selectText();
            editor.underline();

            const text = editor.getCurrentText();
            expect(text).to.equal('__hello__');
        });

        it('append at carret if no text is selected', function () {
            const editor = TestUtils.renderIntoDocument(<Editor/>);
            editor.insertWrapper('hello');
            editor.underline();

            const text = editor.getCurrentText();
            expect(text).to.equal('hello____');
        });
    });

    describe('.strikeThrough()', function () {
        it('surround text if selected', function () {
            const editor = TestUtils.renderIntoDocument(<Editor/>);
            editor.insertWrapper('hello');
            editor.selectText();
            editor.strikeThrough();

            const text = editor.getCurrentText();
            expect(text).to.equal('<s>hello</s>');
        });

        it('append at carret if no text is selected', function () {
            const editor = TestUtils.renderIntoDocument(<Editor/>);
            editor.insertWrapper('hello');
            editor.strikeThrough();

            const text = editor.getCurrentText();
            expect(text).to.equal('hello<s></s>');
        });
    });

    describe('.link()', function () {
        it('set URI automatically if selected', function () {
            const uri = 'https://www.google.com';
            const editor = TestUtils.renderIntoDocument(<Editor/>);
            editor.insertWrapper(uri);
            editor.selectText();
            editor.link();

            const text = editor.getCurrentText();
            expect(text).to.equal(`[Link Name](${uri})`);
        });

        it('set name automatically if selected', function () {
            const name = 'Google';
            const editor = TestUtils.renderIntoDocument(<Editor/>);
            editor.insertWrapper(name);
            editor.selectText();
            editor.link();

            const text = editor.getCurrentText();
            expect(text).to.equal(`[${name}](URI)`);
        });

        it('append link template at caret if no text is selected', function () {
            const editor = TestUtils.renderIntoDocument(<Editor/>);
            editor.insertWrapper('hello');
            editor.link();

            const text = editor.getCurrentText();
            expect(text).to.equal(`hello[Link Name](URI)`);
        });
    });

    describe('.header()', function () {
        it('prepend to text if selected', function () {
            const editor = TestUtils.renderIntoDocument(<Editor/>);
            editor.insertWrapper('hello');
            editor.selectText();
            editor.header(1);

            const text = editor.getCurrentText();
            expect(text).to.equal('# hello');
        });

        it('append at carret if no text is selected', function () {
            const editor = TestUtils.renderIntoDocument(<Editor/>);
            editor.insertWrapper('hello');
            editor.header(1);

            const text = editor.getCurrentText();
            expect(text).to.equal('hello# ');
        });

        it('default to level 1', function () {
            const editor = TestUtils.renderIntoDocument(<Editor/>);
            editor.insertWrapper('hello');
            editor.header();

            const text = editor.getCurrentText();
            expect(text).to.equal('hello# ');
        });

        it('support level 1 to 6', function () {
            const editor = TestUtils.renderIntoDocument(<Editor/>);
            editor.header(1);
            editor.header(2);
            editor.header(3);
            editor.header(4);
            editor.header(5);
            editor.header(6);

            const text = editor.getCurrentText();
            expect(text).to.equal('# ## ### #### ##### ###### ');
        });

        it('clamp the level between 1 and 6', function () {
            const editor = TestUtils.renderIntoDocument(<Editor/>);
            editor.header(-100);
            editor.header(100);
            const text = editor.getCurrentText();
            expect(text).to.equal('# ###### ');
        });
    });

    describe('.unorderedList()', function () {
        it('surround text if selected', function () {
            const editor = TestUtils.renderIntoDocument(<Editor/>);
            editor.insertWrapper('hello');
            editor.selectText();
            editor.unorderedList();

            const text = editor.getCurrentText();
            expect(text).to.equal('* hello');
        });

        it('append at carret if no text is selected', function () {
            const editor = TestUtils.renderIntoDocument(<Editor/>);
            editor.insertWrapper('hello');
            editor.unorderedList();

            const text = editor.getCurrentText();
            expect(text).to.equal('hello* ');
        });
    });

    describe('.orderedList()', function () {
        it('surround text if selected', function () {
            const editor = TestUtils.renderIntoDocument(<Editor/>);
            editor.insertWrapper('hello');
            editor.selectText();
            editor.orderedList();

            const text = editor.getCurrentText();
            expect(text).to.equal('1. hello');
        });

        it('append at carret if no text is selected', function () {
            const editor = TestUtils.renderIntoDocument(<Editor/>);
            editor.insertWrapper('hello');
            editor.orderedList();

            const text = editor.getCurrentText();
            expect(text).to.equal('hello1. ');
        });
    });
});
