/*jslint bitwise: true, browser: true, continue: true, nomen: true, plusplus: true, node: true */
/*global bit, BitDimensions, BitObject, BitVector2D */
/*global goog */

'use strict';

goog.provide('bit.core.BitRectangle');
goog.require('bit.core.bit_namespace');
goog.require('bit.core.BitDimensions');
goog.require('bit.core.BitObject');
goog.require('bit.core.BitVector2D');

BitObject.extend('bit.core.BitRectangle', {
    _construct: function (x, y, width, height) {
        this._constructMixin(BitVector2D, [x, y]);
        this._constructMixin(BitDimensions, [width, height]);
    }
}, null, [BitVector2D, BitDimensions]);