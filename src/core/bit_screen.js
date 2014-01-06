/*jslint bitwise: true, browser: true, continue: true, nomen: true, plusplus: true, node: true */
/*global bit, ArrayBuffer, BitBuffer, BitEntity, BitObject, BitRectangle, Uint32Array, Uint8ClampedArray */
/*global goog */

'use strict';

goog.provide('bit.core.BitScreen');
goog.require('bit.core.bit_namespace');
goog.require('bit.core.BitBuffer');
goog.require('bit.core.BitEntity');
goog.require('bit.core.BitObject');
goog.require('bit.core.BitRectangle');

BitObject.extend('bit.core.BitScreen', {
    DEFAULT_SCREEN_ID: 'DefaultScreen',

    canvas: null,
    data: null,

    _canvasCtx: null,
    _canvasCtxImageData: null,
    _buffer: null,
    _buffer8: null,

    _construct: function (id, width, height) {
        this._constructMixin(BitRectangle, [0, 0, width, height]);
        this._constructMixin(BitEntity, [id]);
        this._constructMixin(BitBuffer, [width, height]);
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this._canvasCtx = this.canvas.getContext('2d');
        this._canvasCtxImageData = this._canvasCtx.getImageData(0, 0, this.width, this.height);
        this._buffer = new ArrayBuffer(this._canvasCtxImageData.data.length);
        this._buffer8 = new Uint8ClampedArray(this._buffer);
        this.data = new Uint32Array(this._buffer);
    },

    tick: function (app, canvas) {
        var id;
        for (id in this.entities) {
            this.entities[id].tick(app, canvas, this);
        }
    },

    render: function (app, canvas) {
        var id;
        for (id in this.entities) {
            this.entities[id].render(app, canvas, this);
        }
        this._canvasCtxImageData.data.set(this._buffer8);
        this._canvasCtx.putImageData(this._canvasCtxImageData, 0, 0);
    }
}, null, [BitEntity, BitRectangle, BitBuffer]);