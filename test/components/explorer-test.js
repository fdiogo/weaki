import '../dom-mock';
import React from 'react'; // eslint-disable-line
import { expect } from 'chai';
import Explorer from '../../src/components/explorer/explorer';
import TestUtils from 'react-addons-test-utils';
import jsdom from 'mocha-jsdom';

describe('Explorer', function () {
    jsdom({ skipWindowCheck: true });
});
