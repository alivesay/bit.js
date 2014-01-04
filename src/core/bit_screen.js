/*jslint bitwise: true, browser: true, continue: true, nomen: true, plusplus: true, node: true */
/*global ArrayBuffer, BitBuffer, BitEntityManager, BitObject, BitRectangle, Uint32Array, Uint8ClampedArray */
/*global goog */

'use strict';

goog.provide('bit.core.BitScreen');
goog.require('bit.core.BitBuffer');
goog.require('bit.core.BitEntityManager');
goog.require('bit.core.BitObject');
goog.require('bit.core.BitRectangle');

var BitScreen = BitObject.extend('BitScreen', {
    canvas: null,
    data: null,

    _canvasCtx: null,
    _canvasCtxImageData: null,
    _buffer: null,
    _buffer8: null,

    _construct: function (width, height) {
        this._constructMixin(BitRectangle, [0, 0, width, height]);
        this._constructMixin(BitEntityManager);
        this._constructMixin(BitBuffer);

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
        var i = this.entities ? this.entities.length : 0;
        while (i--) {
            this.entities[i].tick(app, canvas, this);
        }
    },

    render: function (app, canvas) {
        var i = 0;
        while (i !== this.entities.length) {
            this.entities[i].render(app, canvas, this);
            i++;
        }
        this._canvasCtxImageData.data.set(this._buffer8);
        this._canvasCtx.putImageData(this._canvasCtxImageData, 0, 0);
    }
}, null, [BitRectangle, BitEntityManager, BitBuffer]);