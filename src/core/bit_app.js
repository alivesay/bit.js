/*jslint bitwise: true, browser: true, continue: true, nomen: true, plusplus: true, node: true */
/*global bit_noop, BitEntityManager, BitEventNotifier, BitObject */
/*global goog */

'use strict';

goog.provide('bit.core.BitApp');
goog.require('bit.core.BitObject');
goog.require('bit.core.bit_noop');
goog.require('bit.core.BitEntityManager');
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

var BitApp = BitObject.extend('BitApp', {
    TICK_RATE: 1000 / 60,

    /*
     postProcess: bit_noop,
     overlay: bit_noop,
     pixelShader: bit_noop,
     */
    lastTick: Date.now(),
    running: false,

    _initialized: false,
    _running: false,
    _requestAnimationFrameID: 0,
    _timeoutID: 0,
    _fpsCounter: {
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
        }
    },

    _construct: function (id) {
        this.id = id;
        this._constructMixin(BitEventNotifier);
        this._constructMixin(BitEntityManager);
        this.init();
    },

    init: bit_noop,

    /** Starts rendering and logic tick. */
    start: function () {
        var self = this;

        if (this.running) {
            throw new Error('bit.run: Already running');
        }

        this.running = true;
        this._requestAnimationFrameID = window.requestAnimationFrame(function () { self.render(); });
        this._timeoutID = setTimeout(function () { self.tick(); }, this.TICK_RATE);
    },

    /** Stops rendering and logic tick. */
    stop: function () {
        if (!this.running) {
            throw new Error('bit.stop: Already stopped');
        }

        window.cancelRequestAnimationFrame(this._requestAnimationFrameID);
        clearTimeout(this._timeoutID);
        this.running = false;
    },

    tick: function () {
        var i = this.entities ? this.entities.length : 0,
            self = this;

        while (i--) {
            this.entities[i].tick(this);
        }

        this.lastTick = Date.now();
        this._timeoutID = setTimeout(function () { self.tick(); }, this.TICK_RATE);
    },


    render: function () {
        var i = this.entities ? this.entities.length : 0,
            self = this;

        if (this.running) {
            while (i--) {
                this.entities[i].render(this);
            }

            this._requestAnimationFrameID = window.requestAnimationFrame(function () { self.render(); });
        }
    },

    addCanvas: function (canvas) {
        this.addEntity(canvas);
    },

    removeCanvas: function (canvas) {
        var element = document.getElementById(canvas.canvas.id);
        canvas.parentElement.removeChild(element);
        this.removeCanvas(canvas);
    }
},
    {
        canvases: { get: function () { return this.entities; } },
        fps: { get: function () { return this._fpsCounter.fps | 0; } }
    },

    [BitEventNotifier, BitEntityManager]);