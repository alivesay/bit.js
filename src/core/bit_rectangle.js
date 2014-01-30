/*jslint bitwise: true, browser: true, continue: true, nomen: true, plusplus: true, node: true */
/*global bit, BitInterface, BitObject, IBitRectangle, IBitDimensions, IBitVector2D,
         MBitDimensions, MBitVector2D, MBitRectangle */
/*global goog */

'use strict';

goog.provide('bit.core.BitRectangle');
goog.provide('bit.core.MBitRectangle');
goog.provide('bit.core.IBitRectangle');
goog.require('bit.core.bit_namespace');
goog.require('bit.core.BitObject');
goog.require('bit.core.MBitDimensions');
goog.require('bit.core.MBitVector2D');

BitInterface.extend('bit.core.IBitRectangle', {
    intersects: {
        type: 'function'
    },
    contains: {
        type: 'function'
    }
}).mixin([
    IBitDimensions,
    IBitVector2D
]);

BitObject.extend('bit.core.MBitRectangle', {
    intersects: function (rect) {
        return !(this.x > rect.x + rect.width || this.x + this.width < rect.x ||
                 this.y > rect.y + rect.height || this.y + this.height < rect.y);
    },

    contains: function (x, y) {
        return x >= this.x && x <= this.x + this.width && y >= this.y && y <= this.y + this.width;
    }
}).mixin([
    MBitVector2D,
    MBitDimensions
]);

BitObject.extend('bit.core.BitRectangle', {
    _construct: function (x, y, width, height) {
        this.x = x || this.x;
        this.y = y || this.y;
        this.width = width || this.width;
        this.height = height || this.height;
    }
}).mixin([
    MBitRectangle
]).withInterfaces([
    IBitRectangle
]);

// TODO: should not have _mixins
console.log(Object.keys(IBitRectangle));
