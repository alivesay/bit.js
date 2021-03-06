/*jslint bitwise: true, browser: true, continue: true, nomen: true, plusplus: true, node: true */
/*global bit, ArrayBuffer, BitColor, BitEnum, BitObject, Uint32Array, Uint8ClampedArray */
/*global goog */

'use strict';

goog.provide('bit.core.BitBuffer');
goog.require('bit.core.bit_namespace');
goog.require('bit.core.BitObject');
goog.require('bit.core.BitColor');
goog.require('bit.core.BitEnum');

var BitBufferBlendModes = bit.core.BitBufferBlendModes = BitEnum.create([
    'NONE',
    'SRC_ALPHA'
]);

BitObject.extend('bit.core.BitBuffer', {
    _buffer32LUT: null,
    _buffer8: null,
    _buffer32: null,
    _blendMode: BitBufferBlendModes.NONE,
    _width: 1,
    _height: 1,

    _construct: function (width, height) {
        this._width = width || this._width;
        this._height = height || this._height;

        if (width === undefined && height === undefined) { return; }

        this._buffer32LUT = this._buildLUT(this._width, this._height);
        this._buffer8 = new Uint8ClampedArray(this._width * this._height << 2);
        this._buffer32 = new Uint32Array(this._buffer8.buffer);
    },

    _buildLUT: function (width, height) {
        var x, y, lut = [];
        lut.length = width;
        for (x = 0; x < width; x++) {
            lut[x] = [];
            lut[x].length = height;
            for (y = 0; y < height; y++) {
                lut[x][y] = (x + y * width);
            }
        }

        return lut;
    },

    /** Clears render data. */
    clear: function (color) {
        var i = this._buffer32.length,
            rgba = color.rgba;
        while (i--) {
            this._buffer32[i] = rgba;
        }
    },

    /**  Sets data value for a single pixel. */
    putPixel: function (x, y, r, g, b, a) {
        if (x < 0 || x >= this._width || y < 0 || y >= this._height) { return; }

        this._buffer32[this._buffer32LUT[x][y]] = a << BitColor.ASHIFT | b << BitColor.BSHIFT | g << BitColor.GSHIFT | r << BitColor.RSHIFT;
    },

    /** Draws source data to render data using source-alpha blending. */
    blit: function (sprite, x, y) {
        // TODO: function broken, possible int sign issue, maybe in blendColors.

        var spriteBuffer = sprite.buffer32,
            spriteLUT = sprite.buffer32LUT,
            spriteWidth = sprite.width,
            spriteHeight = sprite.height,
            dx = spriteWidth,
            dy = spriteHeight,
            bx = x + spriteWidth,
            by = y + spriteHeight;

        while (dx--) {
            bx--;
            while (dy--) {
                by--;
                if (bx < 0 || bx >= this._width || by < 0 || by >= this._height) { continue; }
                if ((spriteBuffer[spriteLUT[dx][dy]] >> BitColor.ASHIFT & 0xFF) >>> 0 > 0) {
                    console.log((BitColor.blendColors(spriteBuffer[spriteLUT[dx][dy]], this._buffer32[this._buffer32LUT[bx][by]]) | BitColor.AMASK).toString(16));
                    this._buffer32[this._buffer32LUT[bx][by]] =
                        BitColor.blendColors(spriteBuffer[spriteLUT[dx][dy]],
                                             this._buffer32[this._buffer32LUT[bx][by]]) | BitColor.AMASK;
                }
            }
            dy = spriteHeight;
            by = y + spriteHeight;
        }
    },

    /** Draws source data to render data forcing fixed 0xFF alpha. */
    blitNoAlpha: function (sprite, x, y) {
        var spriteBuffer = sprite.buffer32,
            spriteLUT = sprite.buffer32LUT,
            spriteWidth = sprite.width,
            spriteHeight = sprite.height,
            dx = spriteWidth,
            dy = spriteHeight,
            bx = x + spriteWidth,
            by = y + spriteHeight;

        while (dx--) {
            bx--;
            while (dy--) {
                by--;
                if (bx < 0 || bx >= this._width || by < 0 || by >= this._height) { continue; }
                this._buffer32[this._buffer32LUT[bx][by]] = spriteBuffer[spriteLUT[dx][dy]] | BitColor.AMASK;
            }
            dy = spriteHeight;
            by = y + spriteHeight;
        }
    },

    /** Draws a line to render data using Bresenham's algorithm. */
    drawLine: function (x0, y0, x1, y1, color) {
        var dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1,
            dy = Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1,
            err = (dx > dy ? dx : -dy) >> 1,
            e2 = err;

        while (true) {
            if (x0 >= 0 && y0 >= 0 && x0 < this._width && y0 < this._height) {
                this._buffer32[this._buffer32LUT[x0][y0]] = color;
            }
            if (x0 === x1 && y0 === y1) { break; }
            if (e2 > -dx) { err -= dy; x0 += sx; }
            if (e2 < dy) { err += dx; y0 += sy; }
        }
    },

    /** Draws an unfilled rectangle to render data. */
    drawRect: function (x, y, width, height, color) {

    },

    /** Draws a filled rectangle to render data. */
    fillRect: function (x, y, width, height, color) {
        var x1 = Math.max(0, x),
            y1 = Math.max(0, y),
            x2 = Math.min(this._width, x + width),
            y2 = Math.min(this._height, y + height),
            bx = x2,
            by = y2;

        while (bx-- > x1) {
            while (by-- > y1) {
                this._buffer32[this._buffer32LUT[bx][by]] =
                    BitColor.blendColors(color, this._buffer32[this._buffer32LUT[bx][by]]) | BitColor.AMASK;
            }
            by = y2;
        }
    },

    loadFromIMG: function (img) {
        var canvas = document.createElement('canvas'),
            canvasCtx = canvas.getContext('2d');

        this._width = img.width;
        this._height = img.height;
        this._buffer32LUT = this._buildLUT(this._width, this._height);
        canvasCtx.drawImage(img, 0, 0);
        this._buffer8 = canvasCtx.getImageData(0, 0, this._width, this._height).data;
        this._buffer32 = new Uint32Array(this._buffer8.buffer);

        return this;
    }
}).addAttributes({
    buffer8: {
        get: function () {
            return this._buffer8;
        }
    },

    buffer32: {
        get: function () {
            return this._buffer32;
        }
    },

    buffer32LUT: {
        get: function () {
            return this._buffer32LUT;
        }
    },

    width: {
        get: function () {
            return this._width;
        }
    },

    height: {
        get: function () {
            return this._height;
        }
    }
});