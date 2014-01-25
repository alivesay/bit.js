/*jslint bitwise: true, browser: true, continue: true, nomen: true, plusplus: true, node: true */
/*global bit, ArrayBuffer, BitBuffer, BitColor, BitObject, BitRectangleMixin, BitScreenLayer, BitUtil,
         Uint32Array, Uint8ClampedArray */
/*global goog */

'use strict';

goog.provide('bit.core.BitScreen');
goog.require('bit.core.bit_namespace');
goog.require('bit.core.BitRectangleMixin');
goog.require('bit.core.BitObject');
goog.require('bit.core.BitBuffer');
goog.require('bit.core.BitScreenLayer');
goog.require('bit.core.BitUtil');


BitObject.extend('bit.core.BitScreen', {
    DEFAULT_SCREEN_ID: 'DefaultScreen',

    id: null,

    _canvasCtx: null,
    _canvasCtxImageData: null,
    _canvasCtxImageDataData: null,
    _imgData: null,
    _layers: null,
    _backgroundColor: null,

    _construct: function (width, height) {
        this.setWidth(width || this.getWidth());
        this.setHeight(height || this.getHeight());

        this._canvas = document.createElement('canvas');
        this._canvas.id = 'bit_screen_' + this.instanceUUID;
        this._canvas.width = this.getWidth();
        this._canvas.height = this.getHeight();
        this._canvasCtx = this._canvas.getContext('2d');
        this._canvasCtxImgData = this._canvasCtx.getImageData(0, 0, this.getWidth(), this.getHeight());
        this._canvasCtxImgDataData = this._canvasCtxImgData.data;

        this.buffer = BitBuffer.create(this.getWidth(), this.getHeight());

        this.setBackgroundColor(BitColor.create(255, 0, 255, 255));

        this._layers = [];

        this.addLayer(BitScreenLayer.create(this.getWidth(), this.getHeight()));
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

            this._canvasCtxImgDataData.set(this.buffer.getBuffer8());
            this._canvasCtx.putImageData(this._canvasCtxImgData, 0, 0);
        }
    },

    getLayers: function () {
        return this._layers;
    },

    addLayer: function (layer) {
        this._layers.push(layer);
    },

    removeLayer: function (layer) {
        BitUtil.arrayRemove(this._layers, layer);
    },

    getBackgroundColor: function () {
        return this._backgroundColor;
    },

    setBackgroundColor: function (color) {
        this._backgroundColor = color;
        this._canvas.style.backgroundColor = this._backgroundColor.getRGBACSSString();
    }
}, null, [BitRectangleMixin]);