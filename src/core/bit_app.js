/*jslint bitwise: true, browser: true, continue: true, nomen: true, plusplus: true, node: true */
/*global bit, bit_noop, BitEventNotifier, BitFPSCounter, BitObject, BitUtil */
/*global goog */

'use strict';

goog.provide('bit.core.BitApp');
goog.provide('bit.core.BitFPSCounter');
goog.require('bit.core.bit_namespace');
goog.require('bit.core.BitObject');
goog.require('bit.core.bit_noop');
goog.require('bit.core.BitEventNotifier');

(function () {
    if (!window.requestAnimationFrame) {

        window.requestAnimationFrame = (function () {
            return window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame ||
                window.msRequestAnimationFrame ||
                window.oRequestAnimationFrame ||
                function (callback) { window.setTimeout(callback, 1000 / 60); };
        }());
    }
    if (!window.cancelRequestAnimationFrame) {
        window.cancelRequestAnimationFrame = (function () {
            return window.webkitCancelRequestAnimationFrame ||
                window.webkitCancelAnimationFrame ||
                window.mozCancelRequestAnimationFrame || window.mozCancelAnimationFrame ||
                window.oCancelRequestAnimationFrame || window.oCancelAnimationFrame ||
                window.msCancelRequestAnimationFrame || window.msCancelAnimationFrame ||
                bit_noop;
        }());
    }
}());

BitObject.extend('bit.core.BitFPSCounter', {
    _now: 0,
    _lastUpdate: Date.now(),
    _fpsFilter: 20,
    _thisFrameFPS: 0,
    _delta: 0,

    fps: 0,

    calc: function () {
        this._delta = ((this._now = Date.now()) - this._lastUpdate);
        this._thisFrameFPS = this._delta ? 1000 / this._delta : 0;
        this.fps += (this._thisFrameFPS - this.fps) / this._fpsFilter;
        this._lastUpdate = this._now;

        return this.fps;
    }
});

BitObject.extend('bit.core.BitApp', {
    TICK_RATE: 1000 / 60,

    /*
     postProcess: bit_noop,
     overlay: bit_noop,
     pixelShader: bit_noop,
     */
    lastTick: Date.now(),

    _running: false,
    _requestAnimationFrameID: 0,
    _timeoutID: 0,
    _fpsCounter: null,
    _canvases: null,

    _construct: function (id) {
        this._fpsCounter = BitFPSCounter.create();
        this._canvases = [];
        this.init();
    },

    init: bit_noop,

    /** Starts rendering and logic tick. */
    start: function () {
        var self = this;

        if (this._running) {
            throw new Error('BitApp.run: Already running');
        }

        this._running = true;
        this._requestAnimationFrameID = window.requestAnimationFrame(function () { self.render(self); });
        this._timeoutID = setTimeout(function () { self.tick(self); }, this.TICK_RATE);
    },

    /** Stops rendering and logic tick. */
    stop: function () {
        if (!this._running) {
            throw new Error('BitApp.stop: Already stopped');
        }

        window.cancelRequestAnimationFrame(this._requestAnimationFrameID);
        clearTimeout(this._timeoutID);
        this._running = false;
    },

    tick: function (app) {
        var i;

        if (this._running) {
            for (i = 0; i < this._canvases.length; i++) {
                app._canvases[i].tick(app);
            }
        }

        this.lastTick = Date.now();
        this._timeoutID = setTimeout(function () { app.tick(app); }, this.TICK_RATE);

    },

    render: function (app) {
        var i;

        if (this._running) {
            for (i = 0; i < this._canvases.length; i++) {
                app._canvases[i].render(app);
            }

            this._requestAnimationFrameID = window.requestAnimationFrame(function () { app.render(app); });
        }
    },

    addCanvas: function (canvas, parentElement) {
        this._canvases.push(canvas);
        canvas.setParentElement(parentElement);
    },

    removeCanvas: function (canvas) {
        canvas.setParentElement(null);
    },

    getFPS: function () {
        return this._fpsCounter.fps | 0;
    },

    isRunning: function () {
        return this._running;
    }
});