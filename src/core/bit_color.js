/*jslint bitwise: true, browser: true, continue: true, nomen: true, plusplus: true, node: true */
/*global BitObject, BitUtil */
/*global goog */

'use strict';

goog.provide('bit.core.BitColor');
goog.require('bit.core.BitObject');
goog.require('bit.core.BitUtil');

var BitColor = new BitObject.extend({
    AMASK: BitUtil.isLittleEndian() ? 0xFF000000 : 0x000000FF,
    BMASK: BitUtil.isLittleEndian() ? 0x00FF0000 : 0x0000FF00,
    GMASK: BitUtil.isLittleEndian() ? 0x0000FF00 : 0x00FF0000,
    RMASK: BitUtil.isLittleEndian() ? 0x000000FF : 0xFF000000,
    RGBMASK: BitUtil.isLittleEndian() ? 0x00FFFFFF : 0xFFFFFF00,
    ASHIFT: BitUtil.isLittleEndian() ? 24 : 0,
    BSHIFT: BitUtil.isLittleEndian() ? 16 : 8,
    GSHIFT: BitUtil.isLittleEndian() ? 8 : 16,
    RSHIFT: BitUtil.isLittleEndian() ? 0 : 24,

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