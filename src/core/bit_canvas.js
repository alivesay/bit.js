/*jslint bitwise: true, browser: true, continue: true, nomen: true, plusplus: true, node: true */
/*global bit, BitColor, BitDimensions, BitDimensionsMixin, BitObject, BitScreen, BitUtil */
/*global goog */

'use strict';

goog.provide('bit.core.BitCanvas');
goog.require('bit.core.bit_namespace');
goog.require('bit.core.BitObject');
goog.require('bit.core.BitScreen');
goog.require('bit.core.BitColor');
goog.require('bit.core.BitUtil');
goog.require('bit.core.BitDimensions');

// TODO: z-order sorting on screens, only 2d contexts would need this. also need a bringToFront().

BitObject.extend('bit.core.BitCanvas', {
    _backgroundColor: null,
    _scale: 1,
    _canvas: null,
    _canvasCtx: null,
    _canvasCtxImgData: null,
    _parentElement: null,
    _screens: null,

    _construct: function (width, height, scale) {
        this._super(BitDimensions, 'setWidth', [width || this.getWidth()]);
        this._super(BitDimensions, 'setHeight', [height || this.getHeight()]);
        this._scale = scale || this._scale;

        this._canvas = document.createElement('canvas');
        this._canvas.id = 'bit_canvas_' + this.instanceUUID;
        this._canvasCtx = this._canvas.getContext('2d');
        this._resizeCanvas(this.getWidth(), this.getHeight(), scale);
        this.setSmoothingEnabled(false);

        this.setBackgroundColor(BitColor.create());

        this._screens = [];
        this.addScreen(BitScreen.create(this.getWidth(), this.getHeight()));
    },

    _resizeCanvas: function (width, height, scale) {
        this._canvas.width = width * scale;
        this._canvas.height = height * scale;

        this._canvasCtxImgData = this._canvasCtx.getImageData(0, 0, width, height);

        this._canvasCtx.setTransform(scale, 0, 0, scale, 0, 0);
    },

    setWidth: function (width) {
        this._super(BitDimensions, 'setWidth', [width || this.getWidth()]);
        this._resizeCanvas(width, this.getHeight(), this._scale);
    },

    setHeight: function (height) {
        this._super(BitDimensions, 'setHeight', [height || this.getHeight()]);
        this._resizeCanvas(this.getWidth(), height, this._scale);
    },

    tick: function (app) {
        var i;
        for (i = 0; i < this._screens.length; i++) {
            this._screens[i].tick(app, this);
        }
    },

    render: function (app) {
        var i;

        this._canvasCtx.fillRect(0, 0, this.getWidth(), this.getHeight(), this._backgroundColor.getRGBACSSString());

        for (i = 0; i < this._screens.length; i++) {
            this._screens[i].render(app, this);
            this._canvasCtx.drawImage(this._screens[i]._canvas, this._screens[i].getX(), this._screens[i].getY());
        }
    },

    addScreen: function (screen) {
        this._screens.push(screen);
    },

    removeScreen: function (screen) {
        BitUtil.arrayRemove(this._screens, screen);
    },

    getBackgroundColor: function () {
        return this._backgroundColor;
    },

    setBackgroundColor: function (color) {
        this._backgroundColor = color;
        this._canvas.style.backgroundColor = this._backgroundColor.getRGBACSSString();
    },

    getScreens: function () {
        return this._screens;
    },

    getParentElement: function () {
        return this._parentElement;
    },

    setParentElement: function (element) {
        if (this._parentElement) {
            this._parentElement.removeChild(this._canvas.id);
        }

        if (element) {
            element.appendChild(this._canvas);
        }

        this._parentElement = element;
    },

    setSmoothingEnabled: function (value) {
        this._canvasCtx.imageSmoothingEnabled = value;
        this._canvasCtx.webkitImageSmoothingEnabled = value;
        this._canvasCtx.mozImageSmoothingEnabled = value;
    }
}, null, [BitDimensionsMixin]);