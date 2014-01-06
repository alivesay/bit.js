/*jslint bitwise: true, browser: true, continue: true, nomen: true, plusplus: true, node: true */
/*global bit, BitObject */
/*global goog */

'use strict';

goog.provide('bit.core.BitDimensions');
goog.require('bit.core.bit_namespace');
goog.require('bit.core.BitObject');

BitObject.extend('bit.core.BitDimensions', {
    width: 0,
    height: 0,

    _construct: function (width, height) {
        this.width = width || this.width;
        this.height = height || this.height;
    }
});