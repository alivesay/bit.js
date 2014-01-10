/*jslint bitwise: true, browser: true, continue: true, nomen: true, plusplus: true, node: true */
/*global bit, ArrayBuffer, BitBuffer, BitEntityContainerMixin, BitObject, BitRectangleMixin, BitScreenLayer,
         Uint32Array, Uint8ClampedArray */
/*global goog */

'use strict';

goog.provide('bit.core.BitScreen');
goog.require('bit.core.bit_namespace');
goog.require('bit.core.BitObject');
goog.require('bit.core.BitEntityContainerMixin');
goog.require('bit.core.BitRectangleMixin');
goog.require('bit.core.BitBuffer');
goog.require('bit.core.BitScreenLayer');

BitObject.extend('bit.core.BitScreen', {
    DEFAULT_SCREEN_ID: 'DefaultScreen',

    id: null,
    buffer: null,
    canvas: null,

    _canvasCtx: null,
    _canvasCtxImageData: null,

    _construct: function (id, width, height) {
        this.id = id;
        this.width = width;
        this.height = height;

        this.canvas = document.createElement('canvas');
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this._canvasCtx = this.canvas.getContext('2d');
        this._canvasCtxImageData = this._canvasCtx.getImageData(0, 0, this.width, this.height);

        this.buffer = BitBuffer.create(width, height);

        this.addEntity(BitScreenLayer.create(BitScreenLayer.DEFAULT_LAYER_ID, width, height));
    },

    tick: function (app, canvas) {
        var id;
        for (id in this.entities) {
            if (this.entities.hasOwnProperty(id)) {
                this.entities[id].tick(app, canvas, this);
            }
        }
    },

    render: function (app, canvas) {
        var id;
        for (id in this.entities) {
            if (this.entities.hasOwnProperty(id)) {
                this.entities[id].render(app, canvas, this);
            }
        }
        this._canvasCtxImageData.data.set(this.buffer._buffer8);
        this._canvasCtx.putImageData(this._canvasCtxImageData, 0, 0);
    }
},
    { layers: { get: function () { return this.entities; } } },

    [BitRectangleMixin, BitEntityContainerMixin]);