/*jslint bitwise: true, browser: true, continue: true, nomen: true, plusplus: true, node: true */
/*global bit, BitDimensionsMixin, BitObject, BitVector2DMixin, BitRectangleMixin */
/*global goog */

'use strict';

goog.provide('bit.core.BitRectangle');
goog.provide('bit.core.BitRectangleMixin');
goog.require('bit.core.bit_namespace');
goog.require('bit.core.BitObject');
goog.require('bit.core.BitDimensionsMixin');
goog.require('bit.core.BitVector2DMixin');

BitObject.extend('bit.core.BitRectangleMixin', {}, null, [BitVector2DMixin, BitDimensionsMixin]);

BitObject.extend('bit.core.BitRectangle', {
    _construct: function (x, y, width, height) {
        this.setX(x || this.getX());
        this.setY(y || this.getY());
        this.setWidth(width || this.getWidth());
        this.setHeight(height || this.getHeight());
    }
}, null, [BitRectangleMixin]);