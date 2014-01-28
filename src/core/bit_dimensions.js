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
    _height: 0
}).addAttributes({
    width: {
        get: function () {
            return this._width;
        },

        set: function (width) {
            this._width = width;
        }
    },

    height: {
        get: function () {
            return this._height;
        },

        set: function (height) {
            this._height = height;
        }
    }
});

BitObject.extend('bit.core.BitDimensions', {
    _construct: function (width, height) {
        this.width = width || this.width;
        this.height = height || this.height;
    }
}, [BitDimensionsMixin]);