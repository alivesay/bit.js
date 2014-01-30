/*jslint bitwise: true, browser: true, continue: true, nomen: true, plusplus: true, node: true */
/*global bit, BitInterface, BitObject, IBitDimensions, MBitDimensions */
/*global goog */

'use strict';

goog.provide('bit.core.BitDimensions');
goog.provide('bit.core.IBitDimensions');
goog.provide('bit.core.MBitDimensions');
goog.require('bit.core.bit_namespace');
goog.require('bit.core.BitObject');
goog.require('bit.core.BitInterface');

BitInterface.extend('bit.core.IBitDimensions', {
    width: {
        type: 'number'
    },

    height: {
        type: 'number'
    }
});

BitObject.extend('bit.core.MBitDimensions', {
    width: 0,
    height: 0
});

BitObject.extend('bit.core.BitDimensions', {
    _construct: function (width, height) {
        this.width = width || this.width;
        this.height = height || this.height;
    }
}).mixin([
    MBitDimensions
]).withInterfaces([
    IBitDimensions
]);