/*jslint bitwise: true, browser: true, continue: true, nomen: true, plusplus: true, node: true */
/*global bit, BitObject, BitUtil */
/*global goog */

'use strict';

goog.provide('bit.core.BitColor');
goog.require('bit.core.bit_namespace');
goog.require('bit.core.BitObject');
goog.require('bit.core.BitUtil');

BitObject.extend('bit.core.BitColor', {
    AMASK: 0xFF000000,
    BMASK: 0x00FF0000,
    GMASK: 0x0000FF00,
    RMASK: 0x000000FF,
    RGBMASK: 0x00FFFFFF,
    ASHIFT: 24,
    BSHIFT: 16,
    GSHIFT: 8,
    RSHIFT: 0,

    _construct: function () {
        if (!BitUtil.isLittleEndian()) {
            this.AMASK = 0x000000FF;
            this.BMASK = 0x0000FF00;
            this.GMASK = 0x00FF0000;
            this.RMASK = 0xFF000000;
            this.RGBMASK = 0xFFFFFF00;
            this.ASHIFT = 0;
            this.BSHIFT = 8;
            this.GSHIFT = 16;
            this.RSHIFT = 24;
        }
    },

    /** Returns integer color value from given RGB(A). */
    getColor: function (r, g, b, a) {
        return ((a === undefined ? 255 : a) << this.ASHIFT | b << this.BSHIFT | g << this.GSHIFT | r << this.RSHIFT) >>> 0;
    },

    /** Blends two colors using source-alpha blending. */
    blendColors: function (foregroundColor, backgroundColor) {
        var srcR = foregroundColor >> this.RSHIFT & 0xFF,
            srcG = foregroundColor >> this.GSHIFT & 0xFF,
            srcB = foregroundColor >> this.BSHIFT & 0xFF,
            srcA = foregroundColor >> this.ASHIFT & 0xFF,
            dstR = backgroundColor >> this.RSHIFT & 0xFF,
            dstG = backgroundColor >> this.GSHIFT & 0xFF,
            dstB = backgroundColor >> this.BSHIFT & 0xFF;

        return (srcA === 0) ? backgroundColor : (((srcR * srcA) + (dstR * (255 - srcA))) >> 8) << this.RSHIFT |
            (((srcG * srcA) + (dstG * (255 - srcA))) >> 8) << this.GSHIFT |
            (((srcB * srcA) + (dstB * (255 - srcA))) >> 8) << this.BSHIFT |
            srcA << this.ASHIFT;
    }
});