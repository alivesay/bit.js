/*jslint bitwise: true, browser: true, continue: true, nomen: true, plusplus: true, node: true */
/*global bit, BitEntityContainerMixin, BitObject, BitScreen */
/*global goog */

'use strict';

goog.provide('bit.core.BitCanvas');
goog.require('bit.core.bit_namespace');
goog.require('bit.core.BitEntityContainerMixin');
goog.require('bit.core.BitObject');
goog.require('bit.core.BitScreen');

BitObject.extend('bit.core.BitCanvas', {
    DEFAULT_CANVAS_ID: 'DefaultCanvas',

    width: 0,
    height: 0,
    scale: 1,
    canvas: null,
    canvasCtx: null,
    parentElement: null,

    _construct: function (id, parentElement, width, height, scale) {

        this.parentElement = parentElement;
        this.width = width;
        this.height = height;
        this.scale = scale || this.scale;

        this.addEntity(BitScreen.create(BitScreen.DEFAULT_SCREEN_ID, this.width, this.height));

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

        this.canvas.id = 'bit_screen_' + this.instanceID;
        this.parentElement.appendChild(this.canvas);
    },

    tick: function (app) {
        var id;
        for (id in this.entities) {
            if (this.entities.hasOwnProperty(id)) {
                this.entities[id].tick(app, this);
            }
        }
    },

    render: function (app) {
        var id;
        for (id in this.entities) {
            if (this.entities.hasOwnProperty(id)) {
                this.entities[id].render(app, this);
                this.canvasCtx.drawImage(this.entities[id].canvas, 0, 0);
            }
        }
    },

    addScreen: function (screen) {
        this.addEntity(screen);
    },

    removeScreen: function (screen) {
        this.removeEntity(screen);
    }
},  { screens: { get: function () { return this.entities; } } }, [BitEntityContainerMixin]);