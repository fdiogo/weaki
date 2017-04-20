import '../dom-mock';
import React from 'react'; // eslint-disable-line
import TestUtils from 'react-addons-test-utils';
import { expect } from 'chai';
import TextEditor from '../../src/components/text-editor/text-editor';
import jsdom from 'mocha-jsdom';

describe('TextEditor', function () {
    jsdom({ skipWindowCheck: true });

    describe('.generateTree()', function () {
        it('have root node with all text', function () {
            const text = 'hello';
            const instance = TestUtils.renderIntoDocument(<TextEditor text={text}/>);
            const root = instance.generateTree();

            expect(root.start).to.equal(0);
            expect(root.length).to.equal(text.length);
        });

        it('create child nodes for decorators', function () {
            const text = 'hello sir';
            const decorators = [
                {
                    regex: new RegExp('sir', 'ig'),
                    getClass: match => 'person'
                },
                {
                    regex: new RegExp('hell', 'ig'),
                    getClass: match => 'red'
                }
            ];
            const instance = TestUtils.renderIntoDocument(<TextEditor text={text} decorators={decorators}/>);
            const root = instance.generateTree();
            const personMatch = root.children[0];
            const colorMatch = root.children[1];

            expect(root.children.length).to.equal(2);
            expect(personMatch.class).to.equal('person');
            expect(personMatch.start).to.equal(6);
            expect(colorMatch.class).to.equal('red');
            expect(colorMatch.start).to.equal(0);
        });

        it('allow nested decorations', function () {
            const text = '![name](link)';
            const decorators = [
                {
                    regex: /!\[.*\]\(.*\)/ig,
                    getClass: match => 'image'
                },
                {
                    regex: new RegExp('link', 'ig'),
                    getClass: match => 'reference'
                }
            ];
            const instance = TestUtils.renderIntoDocument(<TextEditor text={text} decorators={decorators}/>);
            const root = instance.generateTree();
            const imageMatch = root.children[0];
            const referenceMatch = imageMatch.children[0];

            expect(root.start).to.equal(0);
            expect(root.length).to.equal(text.length);
            expect(root.children.length).to.equal(1);
            expect(imageMatch.class).to.equal('image');
            expect(imageMatch.start).to.equal(0);
            expect(imageMatch.length).to.equal(text.length);
            expect(imageMatch.children.length).to.equal(1);
            expect(referenceMatch.class).to.equal('reference');
            expect(referenceMatch.start).to.equal(text.indexOf('link'));
            expect(referenceMatch.length).to.equal('link'.length);
            expect(referenceMatch.children.length).to.equal(0);
        });
    });
});
