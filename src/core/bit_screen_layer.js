/*jslint bitwise: true, browser: true, continue: true, nomen: true, plusplus: true, node: true */
/*global bit, BitEntity, BitRectangle, BitVector2D */
/*global goog */

'use strict';

goog.provide('bit.core.BitScreenLayer');
goog.require('bit.core.bit_namespace');
goog.require('bit.core.BitEntity');
goog.require('bit.core.BitRectangle');
goog.require('bit.core.BitVector2D');

BitEntity.extend('bit.core.BitScreenLayer', {
    parallax: 0,

    _construct: function (id) {
        this._constructMixin(BitRectangle);
    }
}, null, [BitRectangle]);