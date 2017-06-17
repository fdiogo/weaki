/* eslint-env browser */
import Decorator from '../decorator';
import React from 'react'; // eslint-disable-line

class SelectionDecorator extends Decorator {}
SelectionDecorator.defaultProps = { className: 'selected' };
export default SelectionDecorator;
