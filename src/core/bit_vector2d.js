/*jslint bitwise: true, browser: true, continue: true, nomen: true, plusplus: true, node: true */
/*global bit, BitInterface, BitObject, BitVector2D, IBitVector2D, MBitVector2D */
/*global goog */

'use strict';

goog.provide('bit.core.BitVector2D');
goog.provide('bit.core.IBitVector2D');
goog.provide('bit.core.MBitVector2D');
goog.require('bit.core.bit_namespace');
goog.require('bit.core.BitObject');
goog.require('bit.core.BitInterface');

BitInterface.extend('bit.core.IBitVector2D', {
    x: {
        type: 'number'
    },
    y: {
        type: 'number'
    },
    cross: {
        type: 'function'
    },
    dot: {
        type: 'function'
    },
    length: {
        type: 'function'
    },
    normalize: {
        type: 'function'
    },
    invertX: {
        type: 'function'
    },
    invertY: {
        type: 'function'
    },
    invert: {
        type: 'function'
    }
});

BitObject.extend('bit.core.MBitVector2D', {
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
            normalVector.x = normalVector.x / length;
            normalVector.y = normalVector.y / length;
        }
        return normalVector;
    },

    invertX: function () {
        this.x = -this.x;
    },

    invertY: function () {
        this.y = -this.y;
    },

    invert: function () {
        this.x = -this.x;
        this.y = -this.y;
    }
});

BitObject.extend('bit.core.BitVector2D', {
    _construct: function (x, y) {
        this.x = x || this.x;
        this.y = y || this.y;
    }
}).mixin([
    MBitVector2D
]).withInterfaces([
    IBitVector2D
]);