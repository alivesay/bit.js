/*jslint bitwise: true, browser: true, continue: true, nomen: true, plusplus: true, node: true */
/*global bit, ArrayBuffer, BitBuffer, BitColor, BitObject, BitScreenLayer, BitUtil, Uint32Array, Uint8ClampedArray */
/*global goog */

'use strict';

goog.provide('bit.core.BitScreen');
goog.require('bit.core.bit_namespace');
goog.require('bit.core.BitObject');
goog.require('bit.core.BitBuffer');
goog.require('bit.core.BitScreenLayer');
goog.require('bit.core.BitUtil');


BitObject.extend('bit.core.BitScreen', {
    _canvasCtx: null,
    _canvasCtxImageData: null,
    _canvasCtxImageDataData: null,
    _imgData: null,
    _layers: null,
    _backgroundColor: null,
    _width: 1,
    _height: 1,
    _x: 0,
    _y: 0,

    _construct: function (width, height, x, y) {
        this._width = width || this._width;
        this._height = height || this._height;
        this._x = x || this._x;
        this._y = y || this._y;

        this._canvas = document.createElement('canvas');
        this._canvas.id = 'bit_screen_' + this.instanceUUID;
        this._canvasCtx = this._canvas.getContext('2d');
        this._resize(width, height);

        this.backgroundColor = BitColor.create();

        this._layers = [];

        this.addLayer(BitScreenLayer.create(width, height));
    },

    _resize: function (width, height) {
        this._canvas.width = width;
        this._canvas.height = height;

        this._canvasCtxImgData = this._canvasCtx.getImageData(0, 0, width, height);
        this._canvasCtxImgDataData = this._canvasCtxImgData.data;

        this._buffer = BitBuffer.create(width, height);
    },

    tick: function (app, canvas) {
        var i;
        for (i = 0; i < this._layers.length; i++) {
            this._layers[i].tick(app, canvas, this);
        }
    },

    render: function (app, canvas) {
        var i;

        this.buffer.clear(this._backgroundColor);

        for (i = 0; i < this._layers.length; i++) {
            this._layers[i].render(app, canvas, this);

            this._canvasCtxImgDataData.set(this._buffer.buffer8);
            this._canvasCtx.putImageData(this._canvasCtxImgData, 0, 0);
        }
    },

    addLayer: function (layer) {
        this._layers.push(layer);
    },

    removeLayer: function (layer) {
        BitUtil.arrayRemove(this._layers, layer);
    }
}).addAttributes({
    x: {
        meta: {
            type: 'number'
        },
        get: function () {
            return this._x;
        },
        set: function (x) {
            this._x = x;
        }
    },

    y: {
        meta: {
            type: 'number'
        },
        get: function () {
            return this._y;
        },
        set: function (y) {
            this._y = y;
        }
    },

    width: {
        meta: {
            type: 'number'
        },
        get: function () {
            return this._width;
        },

        set: function (width) {
            this._width = width;
            this._resize(width, this._height);
        }
    },

    height: {
        meta: {
            type: 'number'
        },
        get: function () {
            return this._height;
        },

        set: function (height) {
            this._height = height;
            this._resize(this._width, height);
        }
    },

    backgroundColor: {
        meta: {
            type: 'BitColor'
        },
        get: function () {
            return this._backgroundColor;
        },
        set: function (color) {
            this._backgroundColor = color;
            this._canvas.style.backgroundColor = this._backgroundColor.rgbaCSSString;
        }
    },

    layers: {
        meta: {
            type: 'Array:BitScreenLayer'
        },
        get: function () {
            return this._layers;
        }
    },

    buffer: {
        meta: {
            type: 'BitBuffer'
        },
        get: function () {
            return this._buffer;
        }
    }
});