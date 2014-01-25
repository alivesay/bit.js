/*jslint bitwise: true, browser: true, continue: true, nomen: true, plusplus: true, node: true */
/*global bit, BitDimensionsMixin, BitObject */
/*global goog */

'use strict';

goog.provide('bit.core.BitDimensions');
goog.provide('bit.core.BitDimensionsMixin');
goog.require('bit.core.bit_namespace');
goog.require('bit.core.BitObject');

BitObject.extend('bit.core.BitDimensionsMixin', {
    _width: 0,
    _height: 0,

    getWidth: function () {
        return this._width;
    },

    setWidth: function (width) {
        this._width = width;
    },

    getHeight: function () {
        return this._height;
    },

    setHeight: function (height) {
        this._height = height;
    },

    setDimensions: function (width, height) {
        this.setWidth(width);
        this.setHeight(height);
    }
});

BitObject.extend('bit.core.BitDimensions', {
    _construct: function (width, height) {
        this.setWidth(width || this.getWidth());
        this.setHeight(height || this.getWidth());
    }
}, null, [BitDimensionsMixin]);