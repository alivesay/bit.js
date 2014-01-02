/*jslint bitwise: true, browser: true, continue: true, nomen: true, plusplus: true, node: true */
/*global BitEntityManager, BitObject, BitScreen */
/*global goog */

'use strict';

goog.provide('bit.core.BitCanvas');
goog.require('bit.core.BitEntityManager');
goog.require('bit.core.BitObject');
goog.require('bit.core.BitScreen');

var BitCanvas = BitObject.extend({
    width: 0,
    height: 0,
    scale: 1,
    canvas: null,
    canvasCtx: null,

    parentElement: null,

    _construct: function (parentElement, width, height, scale) {

        this._constructMixin(BitEntityManager);

        this.parentElement = parentElement;
        this.width = width;
        this.height = height;
        this.scale = scale || this.scale;

        this.addEntity(BitScreen.create(this.width, this.height));

        this.canvas = document.createElement('canvas');
        this.canvas.width = this.width * this.scale;
        this.canvas.height = this.height * this.scale;
        //this.canvas.style.backgroundColor = 'rgb(0,0,0)';
        this.canvasCtx = this.canvas.getContext('2d');
        this.canvasCtx.imageSmoothingEnabled = false;
        this.canvasCtx.webkitImageSmoothingEnabled = false;
        this.canvasCtx.mozImageSmoothingEnabled = false;
        if (this.scale > 1) {
            this.canvasCtx.setTransform(this.scale, 0, 0, this.scale, 0, 0);
        }

        this.canvas.id = 'bit_screen_' + Date.now();
        this.parentElement.appendChild(this.canvas);
    },

    _swapBuffer: function () {
        this._postProcess();
        this._canvasCtxImageData.data.set(this._buf8);

        if (this.scale > 1) {
            this.backBufferCtx.putImageData(this.backBufferCtxImageData, 0, 0);
            this._overlay();
            this.canvasCtx.drawImage(this.backBufferCanvas, 0, 0);
        } else {
            this.canvasCtx.putImageData(this.backBufferCtxImageData, 0, 0);
            this._overlay();
        }
    },

    tick: function (app) {
        var i = this.entities ? this.entities.length : 0;
        while (i--) {
            this.entities[i].tick(app, this);
        }
    },

    render: function (app) {
        var i = this.entities ? this.entities.length : 0;
        while (i--) {
            this.entities[i].render(app, this);
            this.canvasCtx.drawImage(this.entities[i].canvas, 0, 0);
        }
    },

    addScreen: function (screen) {
        this.addEntity(screen);
    },

    removeScreen: function (screen) {
        this.removeEntity(screen);
    }
},  { screens: { get: function () { return this.entities; } } }, [BitEntityManager]);