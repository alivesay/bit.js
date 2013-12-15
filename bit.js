/*global ArrayBuffer, Uint8ClampedArray, Uint32Array */
/*jslint continue: true */

'use strict';

var $bit_global = this;
var bit_noop = function () {};

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

var bit_util = {
    arrayIndexOf: function (array, value) {
        var i, len = array.length;
        for (i = 0; i < len; i++) {
            if (array[i] === value) { return i; }
        }
        return -1;
    },

    arrayRemove: function (array, value) {
        var i = this.arrayIndexOf(array, value);
        if (i !== -1) { array.splice(i, 1); }
    }
};


var bit = {

    SECONDS_PER_FRAME: 1000 / 60,

    $window: window,
    $_bit_render: $bit_global.bit_noop,

    _parentElement: null,
    _app: null,
    _backBufferCtxImageData: null,
    _initialized: false,
    _running: false,
    _requestAnimationFrameID: 0,
    _timeoutID: 0,
    _lastTick: Date.now(),
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

    /* public */
    width: 0,
    height: 0,
    scale: 1,
    backBufferCanvas: null,
    backBufferCtx: null,
    backBufferCtxImageData: null,
    backBufferCtxImageDataData: null,
    screenBufferCanvas: null,
    screenBufferCtx: null,
    offsetLUT: null,
    _backBufferCtxImageDataDataBuffer: null,
    buf8: null,


    init: function (parentElement, app, width, height, scale) {
        if (this._initialized === true) {
            throw new Error("bit.init: Already initialized");
        }

        this.$_bit_render = $bit_global.$_bit_render;
        this._parentElement = parentElement;
        this._app = app;
        this.width = width;
        this.height = height;
        this.scale = scale;

        var x, y;

        this.offsetLUT = [];
        for (x = 0; x < this.width; x++) {
            this.offsetLUT[x] = [];
            for (y = 0; y < this.height; y++) {
                this.offsetLUT[x][y] = (x + y * this.width);
            }
        }

        this.backBufferCanvas = document.createElement('canvas');
        this.backBufferCanvas.id = 'bit_backBuffer_' + new Date().getTime().toString();
        this.backBufferCanvas.width = this.width;
        this.backBufferCanvas.height = this.height;
        this.backBufferCtx = this.backBufferCanvas.getContext('2d');
        this.backBufferCtx.imageSmoothingEnabled = false;
        this.backBufferCtx.webkitImageSmoothingEnabled = false;
        this.backBufferCtx.mozImageSmoothingEnabled = false;

        this.backBufferCtxImageData = this.backBufferCtx.createImageData(this.width, this.height);
        this.backBufferCtxImageDataData = this.backBufferCtxImageData.data;
        this._buf = new ArrayBuffer(this.backBufferCtxImageDataData.length);
        this._buf8 = new Uint8ClampedArray(this._buf);
        this.buffer = new Uint32Array(this._buf);

        if (this.scale > 1) {
            this.screenBufferCanvas = document.createElement('canvas');
            this.screenBufferCanvas.id = 'bit_frameBuffer_' + new Date().getTime().toString();
            this.screenBufferCanvas.width = this.width * this.scale;
            this.screenBufferCanvas.height = this.height * this.scale;
            this.screenBufferCanvas.style.backgroundColor = 'rgb(0,0,0)';
            this.screenBufferCtx = this.screenBufferCanvas.getContext('2d');
            this.screenBufferCtx.imageSmoothingEnabled = false;
            this.screenBufferCtx.webkitImageSmoothingEnabled = false;
            this.screenBufferCtx.mozImageSmoothingEnabled = false;
            this.screenBufferCtx.setTransform(this.scale, 0, 0, this.scale, 0, 0);

        } else {
            this.screenBufferCanvas = this.backBufferCanvas;
            this.screenBufferCtx = this.backBufferCtx;
        }
        this._parentElement.appendChild(this.backBufferCanvas);
        this._parentElement.appendChild(this.screenBufferCanvas);

        this._app.init();

        this._initialized = true;
        this._running = false;
    },

    start: function () {
        var self = this;

        if (this._running) {
            throw new Error('bit.run: Already running');
        }

        this._running = true;

        this._requestAnimationFrameID = this.$window.requestAnimationFrame(this.$_bit_render);
        this._timeoutID = setTimeout(function () { self._tick(self); }, self.SECONDS_PER_FRAME);
    },

    stop: function () {
        if (!this._running) {
            throw new Error('bit.stop: Already stopped');
        }

        this.$window.cancelRequestAnimationFrame(this._requestAnimationFrameID);
        clearTimeout(this._timeoutID);
        this._running = false;
    },

    _tick: function (self) {
        self._app.tick();
        self._lastTick = Date.now();
        self._timeoutID = setTimeout(function () { self._tick(self); }, self.SECONDS_PER_FRAME);
    },

    _render: function () {
        this._app.render();
        this._swapBuffer();

        this._fpsCounter.calc();

        if (this._running) {
            this._requestAnimationFrameID = this.$window.requestAnimationFrame(this.$_bit_render);
        }
    },

    _swapBuffer: function () {
        this._postProcess();
        this.backBufferCtxImageDataData.set(this._buf8);

        if (this.scale > 1) {
            this.backBufferCtx.putImageData(this.backBufferCtxImageData, 0, 0);
            this._overlay();
            this.screenBufferCtx.drawImage(this.backBufferCanvas, 0, 0);
        } else {
            this.screenBufferCtx.putImageData(this.backBufferCtxImageData, 0, 0);
            this._overlay();
        }
    },

    _postProcess: function () {
        this._app.postProcess();
    },

    _overlay: function () {
        this._app.overlay();
    },

    fps: function () { return this._fpsCounter.fps; },

    clear: function () {

    },

    putPixel: function (x, y, r, g, b, a) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) { return; }

        this.buffer[this.offsetLUT[x][y]] = (a << 24) | (b << 16) | (g << 8) | r;

        this._app.pixelShader();
    },

    blit: function (sprite, x, y) {
        var $data = sprite.buffer,
            spriteWidth = sprite.width,
            spriteHeight = sprite.height,
            dx = spriteWidth,
            dy = spriteHeight,
            bx = x + spriteWidth,
            by = y + spriteHeight,
            offset;

        while (dx--) {
            bx--;
            while (dy--) {
                by--;
                if (bx < 0 || bx >= this.width || by < 0 || by >= this.height) { break; }
                offset = (dx + dy * spriteWidth);
                if ($data[offset] << 24) {
                    this.buffer[this.offsetLUT[bx][by]] = $data[offset];
                }
            }
            dy = spriteHeight;
            by = y + spriteHeight;
        }
    },

    blitNoAlpha: function (sprite, x, y) {
        var $data = sprite.buffer,
            spriteWidth = sprite.width,
            spriteHeight = sprite.height,
            dx = spriteWidth,
            dy = spriteHeight,
            bx = x + spriteWidth,
            by = y + spriteHeight;

        while (dx--) {
            bx--;
            while (dy--) {
                by--;
                if (bx < 0 || bx >= this.width || by < 0 || by >= this.height) { break; }
                this.buffer[this.offsetLUT[bx][by]] = $data[(dx + dy * spriteWidth)] | 0xFF000000;
            }
            dy = spriteHeight;
            by = y + spriteHeight;
        }
    },

    drawLine: function (x0, y0, x1, y1, color) {
        // Bresenham's Line Algorithm}
        var dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1,
            dy = Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1,
            err = (dx > dy ? dx : -dy) >> 1,
            e2 = err;

        while (true) {
            if (x0 >= 0 && y0 >= 0 && x0 < this.width && y0 < this.height) {
                this.buffer[this.offsetLUT[x0][y0]] = color;
            }
            if (x0 === x1 && y0 === y1) { break; }
            if (e2 > -dx) { err -= dy; x0 += sx; }
            if (e2 < dy) { err += dx; y0 += sy; }
        }
    },

    drawRect: function (x, y, w, h, color) {

    }
};

var $_bit_render = function () {
    bit._render();
};

var BitEntity = function () {
    this.x = 0;
    this.y = 0;
    this.w = 0;
    this.h = 0;
    this.xSpeed = 0;
    this.ySpeed = 0;
};

BitEntity.prototype.tick = function () {
    this.x += this.xSpeed;
    this.y += this.ySpeed;
};

BitEntity.prototype.render = function () {
    bit.strokeRect(this.x, this.y, this.w, this.h, 0xFF0FF00FF);
};

var BitEntityManager = function () {
    this.entities = [];
};

BitEntityManager.prototype.addEntity = function (entity) {
    this.entities.push(entity);
};

BitEntityManager.prototype.removeEntity = function (entity) {
    bit_util.arrayRemove(this.entities, entity);
};

BitEntityManager.prototype.tick = function () {
    var $len = this.entities.length, i;
    for (i = 0; i < $len; i++) {
        this.entities[i].tick();
    }
};

BitEntityManager.prototype.render = function () {
    var $len = this.entities.length, i;
    for (i = 0; i < $len; i++) {
        this.entities[i].render();
    }
};


var BitApp = function () {
    this.entityManager = new BitEntityManager();
};

BitApp.prototype.init = bit_noop;
BitApp.prototype.tick = function () { this.entityManager.tick(); };
BitApp.prototype.render = function () { this.entityManager.render(); };
BitApp.prototype.postProcess = bit_noop;
BitApp.prototype.overlay = bit_noop;
BitApp.prototype.pixelShader = bit_noop;