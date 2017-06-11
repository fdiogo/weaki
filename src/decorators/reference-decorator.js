/* eslint-env browser */
import Decorator from './decorator';
import React from 'react'; // eslint-disable-line

class ReferenceDecorator extends Decorator {}

ReferenceDecorator.regex = /\[([^\]@]*)(?:@([^\]#]*))?(?:#([A-Za-z0-9~^]*))?\]/g;
ReferenceDecorator.defaultProps = { class: 'reference' };
ReferenceDecorator.breakable = false;
export default ReferenceDecorator;
