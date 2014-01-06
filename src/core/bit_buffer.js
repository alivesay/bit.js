/*jslint bitwise: true, browser: true, continue: true, nomen: true, plusplus: true, node: true */
/*global bit, ArrayBuffer, BitColor, BitObject, Uint32Array, Uint8ClampedArray */
/*global goog */

'use strict';

goog.provide('bit.core.BitBuffer');
goog.require('bit.core.bit_namespace');
goog.require('bit.core.BitColor');
goog.require('bit.core.BitObject');

BitObject.extend('bit.core.BitBuffer', {
    width: 0,
    height: 0,
    data: null,
    dataLUT: null,

    _buffer: null,
    _buffer8: null,

    _construct: function (width, height) {
        this.width = width || this.width;
        this.height = height || this.height;

        this.dataLUT = this._buildLUT(this.width, this.height);

        this._buffer = new ArrayBuffer(this.width * this.height * 4);
        this._buffer8 = new Uint8ClampedArray(this._buffer);
        this.data = new Uint32Array(this._buffer);
    },

    _buildLUT: function (xCount, yCount) {
        var x, y, lut = [];
        lut.length = xCount;
        for (x = 0; x < xCount; x++) {
            lut[x] = [];
            lut[x].length = yCount;
            for (y = 0; y < yCount; y++) {
                lut[x][y] = (x + y * xCount);
            }
        }

        return lut;
    },

    /** Clears render data. */
    clear: function (color) {
        var i = this.data.length;
        while (i--) {
            this.data[i] = color;
        }
    },

    /**  Sets data value for a single pixel. */
    putPixel: function (x, y, r, g, b, a) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) { return; }

        this.data[this.dataLUT[x][y]] = a << BitColor.ASHIFT | b << BitColor.BSHIFT | g << BitColor.GSHIFT | r << BitColor.RSHIFT;
    },

    /** Draws source data to render data using source-alpha blending. */
    blit: function (sprite, x, y) {
        var $data = sprite.data,
            spriteWidth = sprite.width,
            spriteHeight = sprite.height,
            dx = spriteWidth,
            dy = spriteHeight,
            bx = x + spriteWidth,
            by = y + spriteHeight,
            offset;

        while (dx--) {
            bx--;
            while (dy--) {
                by--;
                if (bx < 0 || by < 0 || bx >= this.width || by >= this.height) { continue; }
                offset = (dx + dy * spriteWidth);
                if ($data[offset] >> BitColor.ASHIFT & BitColor.AMASK) {
                    this.data[this.dataLUT[bx][by]] = this.blendColors($data[offset], this.data[this.dataLUT[bx][by]]) | BitColor.AMASK;
                }
            }
            dy = spriteHeight;
            by = y + spriteHeight;
        }
    },

    /** Draws source data to render data forcing fixed 0xFF alpha. */
    blitNoAlpha: function (sprite, x, y) {
        var spriteWidth = sprite.width,
            spriteHeight = sprite.height,
            dx = spriteWidth,
            dy = spriteHeight,
            bx = x + spriteWidth,
            by = y + spriteHeight;

        while (dx--) {
            bx--;
            while (dy--) {
                by--;
                if (bx < 0 || bx >= this.width || by < 0 || by >= this.height) { continue; }
                this.data[this.dataLUT[bx][by]] = sprite.data[sprite.dataLUT[dx][dy]] | BitColor.AMASK;
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
            if (x0 >= 0 && y0 >= 0 && x0 < this.width && y0 < this.height) {
                this.data[this.dataLUT[x0][y0]] = color;
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
            x2 = Math.min(this.width, x + width),
            y2 = Math.min(this.height, y + height),
            bx = x2,
            by = y2;

        while (bx-- > x1) {
            while (by-- > y1) {
                this.data[this.dataLUT[bx][by]] = BitColor.blendColors(color, this.data[this.dataLUT[bx][by]]) | BitColor.AMASK;
            }
            by = y2;
        }
    }
});