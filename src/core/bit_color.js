/*jslint bitwise: true, browser: true, continue: true, nomen: true, plusplus: true, node: true */
/*global bit, BitMath, BitObject, BitUtil */
/*global goog */

'use strict';

goog.provide('bit.core.BitColor');
goog.require('bit.core.bit_namespace');
goog.require('bit.core.BitObject');
goog.require('bit.core.BitUtil');
goog.require('bit.core.BitMath');

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
    r: 0x00,
    g: 0x00,
    b: 0x00,
    a: 0xFF,

    _construct: function (r, g, b, a) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a || this.a;
    },

    // TODO: should probably be in a graphics class instead
    /** Blends two colors using source-alpha blending. */
    blendColors: function (foregroundColor, backgroundColor) {
        var frgba = foregroundColor.getRGBA(),
            brgba = backgroundColor.getRGBA(),
            srcR = frgba >> this.RSHIFT & 0xFF,
            srcG = frgba >> this.GSHIFT & 0xFF,
            srcB = frgba >> this.BSHIFT & 0xFF,
            srcA = frgba >> this.ASHIFT & 0xFF,
            dstR = brgba >> this.RSHIFT & 0xFF,
            dstG = brgba >> this.GSHIFT & 0xFF,
            dstB = brgba >> this.BSHIFT & 0xFF;

        return (srcA === 0) ? brgba : (((srcR * srcA) + (dstR * (255 - srcA))) >> 8) << this.RSHIFT |
                                      (((srcG * srcA) + (dstG * (255 - srcA))) >> 8) << this.GSHIFT |
                                      (((srcB * srcA) + (dstB * (255 - srcA))) >> 8) << this.BSHIFT |
                                      srcA << this.ASHIFT;
    },

    getRGBA: function () {
        return (this.r << this.RSHIFT |
                this.g << this.GSHIFT |
                this.b << this.BSHIFT |
                this.a << this.ASHIFT) >>> 0;
    },

    setRGBA: function (rgbaValue) {
        this.r = rgbaValue >> this.RSHIFT & 0xFF;
        this.g = rgbaValue >> this.GSHIFT & 0xFF;
        this.b = rgbaValue >> this.BSHIFT & 0xFF;
        this.a = rgbaValue >> this.ASHIFT & 0xFF;
    },

    getRGBACSSString: function () {
        return 'rgba(' + this.r + ',' + this.g + ',' + this.b + ',' + this.a + ')';
    },

    getNormalArray: function () {
        return [this.r / 255, this.g / 255, this.b / 255, this.a / 255];
    }
});

(function (self) {
    if (!bit.core.BitUtil.isLittleEndian()) {
        self.AMASK = 0x000000FF;
        self.BMASK = 0x0000FF00;
        self.GMASK = 0x00FF0000;
        self.RMASK = 0xFF000000;
        self.RGBMASK = 0xFFFFFF00;
        self.ASHIFT = 0;
        self.BSHIFT = 8;
        self.GSHIFT = 16;
        self.RSHIFT = 24;
    }
}(bit.core.BitColor));