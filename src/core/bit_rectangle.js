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

BitObject.extend('bit.core.BitRectangleMixin', {}, [BitVector2DMixin, BitDimensionsMixin]);

BitObject.extend('bit.core.BitRectangle', {
    _construct: function (x, y, width, height) {
        this.x = x || this.x;
        this.y = y || this.y;
        this.width = width || this.width;
        this.height = height || this.height;
    },

    intersects: function (rect) {
        return !(this.x > rect.x + rect.width || this.x + this.width < rect.x ||
                 this.y > rect.y + rect.height || this.y + this.height < rect.y);
    },

    contains: function (x, y) {
        return x >= this.x && x <= this.x + this.width && y >= this.y && y <= this.y + this.width;
    }
}, [BitRectangleMixin]);