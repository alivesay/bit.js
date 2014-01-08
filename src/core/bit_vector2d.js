/*jslint bitwise: true, browser: true, continue: true, nomen: true, plusplus: true, node: true */
/*global bit, BitObject, BitVector2DMixin */
/*global goog */

'use strict';

goog.provide('bit.core.BitVector2D');
goog.provide('bit.core.BitVector2DMixin');
goog.require('bit.core.bit_namespace');
goog.require('bit.core.BitObject');

BitObject.extend('bit.core.BitVector2DMixin', {
    x: 0,
    y: 0,

    cross: function (vector) {
        return this.x * vector.y + this.y * vector.x;
    },
    dot: function (vector) {
        return this.x * vector.x + this.y * vector.y;
    },
    length: function () {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    },
    normalize: function () {
        var normalVector = BitVector2D.create(),
            length = this.length();
        if (length > 0) {
            normalVector.x /= length;
            normalVector.y /= length;
        }
        return normalVector;
    }
});

BitObject.extend('bit.core.BitVector2D', {
    _construct: function (x, y) {
        this.x = x || this.x;
        this.y = y || this.y;
    }
}, null, [BitVector2DMixin]);