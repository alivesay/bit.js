/*jslint bitwise: true, browser: true, continue: true, nomen: true, plusplus: true, node: true */
/*global bit, BitColor, BitObject, BitScreen, BitUtil */
/*global goog */

'use strict';

goog.provide('bit.core.BitCanvas');
goog.require('bit.core.bit_namespace');
goog.require('bit.core.BitObject');
goog.require('bit.core.BitScreen');
goog.require('bit.core.BitColor');
goog.require('bit.core.BitUtil');

// TODO: z-order sorting on screens, only 2d contexts would need this. also need a bringToFront().

BitObject.extend('bit.core.BitCanvas', {
    _backgroundColor: null,
    _scale: 1,
    _canvas: null,
    _canvasCtx: null,
    _canvasCtxImgData: null,
    _parentElement: null,
    _screens: null,
    _width: 1,
    _height: 1,
    _smoothingEnabled: false,

    _construct: function (width, height, scale) {
        this._width = width;
        this._height = height;
        this._scale = scale || this._scale;

        this._canvas = document.createElement('canvas');
        this._canvas.id = 'bit_canvas_' + this.instanceUUID;
        this._canvasCtx = this._canvas.getContext('2d');
        this._resize(width, height, scale);
        this.smoothingEnabled = false;

        this.backgroundColor = BitColor.create();

        this._screens = [];
        this.addScreen(BitScreen.create(width, height));
    },

    _resize: function (width, height, scale) {
        this._canvas.width = width * scale;
        this._canvas.height = height * scale;

        this._canvasCtxImgData = this._canvasCtx.getImageData(0, 0, width, height);

        this._canvasCtx.setTransform(scale, 0, 0, scale, 0, 0);
    },

    tick: function (app) {
        var i;
        for (i = 0; i < this._screens.length; i++) {
            this._screens[i].tick(app, this);
        }
    },

    render: function (app) {
        var i;

        this._canvasCtx.fillRect(0, 0, this._width, this._height, this._backgroundColor.rgbaCSSString);

        for (i = 0; i < this._screens.length; i++) {
            this._screens[i].render(app, this);
            this._canvasCtx.drawImage(this._screens[i]._canvas, this._screens[i].x, this._screens[i].y);
        }
    },

    addScreen: function (screen) {
        this._screens.push(screen);
    },

    removeScreen: function (screen) {
        BitUtil.arrayRemove(this._screens, screen);
    }
}).addAttributes({
    width: {
        get: function () {
            return this._width;
        },

        set: function (width) {
            this._width = width;
            this._resize(width, this._height, this._scale);
        }
    },

    height: {
        get: function () {
            return this._height;
        },

        set: function (height) {
            this._height = height;
            this._resize(this._width, height, this._scale);
        }
    },

    backgroundColor: {
        get: function () {
            return this._backgroundColor;
        },

        set: function (color) {
            this._backgroundColor = color;
            this._canvas.style.backgroundColor = this._backgroundColor.rgbaCSSString;
        }
    },

    screens: {
        get: function () {
            return this._screens;
        }
    },

    parentElement: {
        get: function () {
            return this._parentElement;
        },

        set: function (element) {
            if (this._parentElement) {
                this._parentElement.removeChild(document.getElementById(this._canvas.id));
            }

            if (element) {
                element.appendChild(this._canvas);
            }

            this._parentElement = element;
        }
    },

    smoothingEnabled: {
        get: function () {
            return this._smoothingEnabled;
        },

        set: function (bool) {
            this._smoothingEnabled = bool;
            this._canvasCtx.imageSmoothingEnabled = bool;
            this._canvasCtx.webkitImageSmoothingEnabled = bool;
            this._canvasCtx.mozImageSmoothingEnabled = bool;
        }
    }
});