import '../dom-mock';
import React from 'react'; // eslint-disable-line
import { expect } from 'chai';
import TextEditor from '../../src/components/text-editor/text-editor';
import jsdom from 'mocha-jsdom';

describe.only('TextEditor', function () {
    jsdom({ skipWindowCheck: true });

    describe('.envolveOrphanText()', function () {
        it('envolve word to span', function () {
            expect(TextEditor.envolveOrphanText('foo')).to.equal('<span>foo</span>');
        });

        it('envolve word before other span', function () {
            expect(TextEditor.envolveOrphanText('foo<span>bar</span>')).to.equal('<span>foo</span><span>bar</span>');
        });

        it('envolve word after other span', function () {
            expect(TextEditor.envolveOrphanText('<span>bar</span>foo')).to.equal('<span>bar</span><span>foo</span>');
        });

        it('envolve word between spans', function () {
            expect(TextEditor.envolveOrphanText('<span>bar</span>foo<span>foobar</span>')).to.equal('<span>bar</span><span>foo</span><span>foobar</span>');
        });
    });
});
