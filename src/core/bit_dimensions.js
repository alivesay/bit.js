/*jslint bitwise: true, browser: true, continue: true, nomen: true, plusplus: true, node: true */
/*global bit, BitDimensionsMixin, BitObject */
/*global goog */

'use strict';

goog.provide('bit.core.BitDimensions');
goog.provide('bit.core.BitDimensionsMixin');
goog.require('bit.core.bit_namespace');
goog.require('bit.core.BitObject');

BitObject.extend('bit.core.BitDimensionsMixin', {
    width: 0,
    height: 0
});

BitObject.extend('bit.core.BitDimensions', {
    _construct: function (width, height) {
        this.width = width || this.width;
        this.height = height || this.height;
    }
}, null, [BitDimensionsMixin]);