import '../dom-mock';
import React from 'react'; // eslint-disable-line
import { expect } from 'chai';
import Editor from '../../src/components/editor/editor';
import TestUtils from 'react-addons-test-utils';
import jsdom from 'mocha-jsdom';

describe('Editor', function () {
    jsdom({ skipWindowCheck: true });

    describe('.constructor()', function () {
        it('default "content" in state if none provided', function () {
            const editor = TestUtils.renderIntoDocument(<Editor />);
            expect(editor.state.content).to.equal('');
        });

        it('"content" in state equal to props if provided', function () {
            const initialContent = 'hello';
            const editor = TestUtils.renderIntoDocument(<Editor content={initialContent}/>);
            expect(editor.state.content).to.equal(initialContent);
        });

        it('no text selected', function () {
            const initialContent = 'hello';
            const editor = TestUtils.renderIntoDocument(<Editor content={initialContent}/>);
            expect(editor.isTextSelected()).to.be.false;
        });
    });

    describe('.bold()', function () {
        it('surround text if selected', function () {
            const editor = TestUtils.renderIntoDocument(<Editor content='hello'/>);
            editor.selectText();
            editor.bold();

            const text = editor.getCurrentText();
            expect(text).to.equal('**hello**');
        });

        it('append at carret if no text is selected', function () {
            const editor = TestUtils.renderIntoDocument(<Editor content='hello'/>);
            editor.setCaretPosition(0);
            editor.bold();

            const text = editor.getCurrentText();
            expect(text).to.equal('****hello');
        });
    });

    describe('.italic()', function () {
        it('surround text if selected', function () {
            const editor = TestUtils.renderIntoDocument(<Editor content='hello'/>);
            editor.selectText();
            editor.italic();

            const text = editor.getCurrentText();
            expect(text).to.equal('_hello_');
        });

        it('append at carret if no text is selected', function () {
            const editor = TestUtils.renderIntoDocument(<Editor content='hello'/>);
            editor.setCaretPosition(0);
            editor.italic();

            const text = editor.getCurrentText();
            expect(text).to.equal('__hello');
        });
    });

    describe('.underline()', function () {
        it('surround text if selected', function () {
            const editor = TestUtils.renderIntoDocument(<Editor content='hello'/>);
            editor.selectText();
            editor.underline();

            const text = editor.getCurrentText();
            expect(text).to.equal('__hello__');
        });

        it('append at carret if no text is selected', function () {
            const editor = TestUtils.renderIntoDocument(<Editor content='hello'/>);
            editor.setCaretPosition(0);
            editor.underline();

            const text = editor.getCurrentText();
            expect(text).to.equal('____hello');
        });
    });

    describe('.strikeThrough()', function () {
        it('surround text if selected', function () {
            const editor = TestUtils.renderIntoDocument(<Editor content='hello'/>);
            editor.selectText();
            editor.strikeThrough();

            const text = editor.getCurrentText();
            expect(text).to.equal('~~hello~~');
        });

        it('append at carret if no text is selected', function () {
            const editor = TestUtils.renderIntoDocument(<Editor content='hello'/>);
            editor.setCaretPosition(0);
            editor.strikeThrough();

            const text = editor.getCurrentText();
            expect(text).to.equal('~~~~hello');
        });
    });

    describe('.link()', function () {
        it('set URI automatically if selected', function () {
            const uri = 'https://www.google.com';
            const editor = TestUtils.renderIntoDocument(<Editor content={uri}/>);
            editor.selectText();
            editor.link();

            const text = editor.getCurrentText();
            expect(text).to.equal(`[Link Name](${uri})`);
        });

        it('set name automatically if selected', function () {
            const name = 'Google';
            const editor = TestUtils.renderIntoDocument(<Editor content={name}/>);
            editor.selectText();
            editor.link();

            const text = editor.getCurrentText();
            expect(text).to.equal(`[${name}](URI)`);
        });

        it('append link template at caret if no text is selected', function () {
            const editor = TestUtils.renderIntoDocument(<Editor content='hello'/>);
            editor.setCaretPosition(0);
            editor.link();

            const text = editor.getCurrentText();
            expect(text).to.equal(`[Link Name](URI)hello`);
        });
    });

    describe('.header()', function () {
        it('prepend to text if selected', function () {
            const editor = TestUtils.renderIntoDocument(<Editor content='hello'/>);
            editor.selectText();
            editor.header(1);

            const text = editor.getCurrentText();
            expect(text).to.equal(`# hello`);
        });

        it('append at carret if no text is selected', function () {
            const editor = TestUtils.renderIntoDocument(<Editor content='hello'/>);
            editor.setCaretPosition(1);
            editor.header(1);

            const text = editor.getCurrentText();
            expect(text).to.equal('h# ello');
        });

        it('default to level 1', function () {
            const editor = TestUtils.renderIntoDocument(<Editor content='hello'/>);
            editor.setCaretPosition(1);
            editor.header();

            const text = editor.getCurrentText();
            expect(text).to.equal('h# ello');
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
            const editor = TestUtils.renderIntoDocument(<Editor content='hello'/>);
            editor.selectText();
            editor.unorderedList();

            const text = editor.getCurrentText();
            expect(text).to.equal('* hello');
        });

        it('append at carret if no text is selected', function () {
            const editor = TestUtils.renderIntoDocument(<Editor content='hello'/>);
            editor.setCaretPosition(1);
            editor.unorderedList();

            const text = editor.getCurrentText();
            expect(text).to.equal('h* ello');
        });
    });

    describe('.orderedList()', function () {
        it('surround text if selected', function () {
            const editor = TestUtils.renderIntoDocument(<Editor content='hello'/>);
            editor.selectText();
            editor.orderedList();

            const text = editor.getCurrentText();
            expect(text).to.equal('1. hello');
        });

        it('append at carret if no text is selected', function () {
            const editor = TestUtils.renderIntoDocument(<Editor content='hello'/>);
            editor.setCaretPosition(1);
            editor.orderedList();

            const text = editor.getCurrentText();
            expect(text).to.equal('h1. ello');
        });
    });
});
