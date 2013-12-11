'use strict';

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


var bit = {

    SECONDS_PER_FRAME: 1000 / 60,

    $window: window,

    _parentElement: null,
    _app: null,
    _pixelId: null,
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
    backBuffer: null,
    backBufferCtx: null,
    screenBuffer: null,
    screenBufferCtx: null,
    framebuffer: null,
    offsetLUT: null,


    init: function (parentElement, app, width, height, scale) {
        if (this._initialized === true) {
            throw new Error("bit.init: Already initialized");
        }

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
                this.offsetLUT[x][y] = (x + y * this.width) << 2;
            }
        }

        this.backBuffer = document.createElement('canvas');
        this.backBuffer.id = 'bit_backBuffer_' + new Date().getTime().toString();
        this.backBuffer.width = this.width;
        this.backBuffer.height = this.height;
        this.backBufferCtx = this.backBuffer.getContext('2d');

        this.screenBuffer = document.createElement('canvas');
        this.screenBuffer.id = 'bit_frameBuffer_' + new Date().getTime().toString();
        this.screenBuffer.width = this.width * this.scale;
        this.screenBuffer.height = this.height * this.scale;
        this.screenBuffer.style.backgroundColor = 'rgb(0,0,0)';
        this.screenBufferCtx = this.screenBuffer.getContext('2d');
        this.screenBufferCtx.imageSmoothingEnabled = false;
        this.screenBufferCtx.webkitImageSmoothingEnabled = false;
        this.screenBufferCtx.mozImageSmoothingEnabled = false;
        this.screenBufferCtx.scale(this.scale, this.scale);

        this._parentElement.appendChild(this.screenBuffer);

        this._pixelId = this.screenBufferCtx.getImageData(0, 0, this.width, this.height);
        this.framebuffer = this._pixelId.data;

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

        this._requestAnimationFrameID = this.$window.requestAnimationFrame(function () { self._render(self); });
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

    _render: function (self) {
        self._app.render();
        self._swapBuffer();

        self._fpsCounter.calc();

        if (self._running) {
            self._requestAnimationFrameID = self.$window.requestAnimationFrame(function () { self._render(self); });
        }
    },

    _swapBuffer: function () {
        this._postProcess();
        this.backBufferCtx.putImageData(this._pixelId, 0, 0);
        this._overlay();
        this.screenBufferCtx.drawImage(this.backBuffer, 0, 0);
    },

    _postProcess: function () {
        this._app.postProcess();
    },

    _overlay: function () {
        this._app.overlay();
    },

    fps: function () { return this._fpsCounter.fps; },

    putPixel: function (x, y, r, g, b, a) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) { return; }

        this.framebuffer[this.offsetLUT[x][y]] = r;
        this.framebuffer[this.offsetLUT[x][y] + 1] = g;
        this.framebuffer[this.offsetLUT[x][y] + 2] = b;
        this.framebuffer[this.offsetLUT[x][y] + 3] = a;

        this._app.pixelShader();
    },

    blit: function (sprite, x, y) {
        var $data = sprite.imgData.data, offset, i, j;

        for (i = 0; i < sprite.width; i++) {
            for (j = 0; j < sprite.height; j++) {
                offset = (i + j * sprite.width) << 2;
                if ($data[offset + 3] > 0) {
                    this.putPixel(x + i, y + j, $data[offset],
                                                $data[offset + 1],
                                                $data[offset + 2],
                                                $data[offset + 3]);
                }
            }
        }
    }
};


var BitApp = function () {};

BitApp.prototype.init = bit_noop;
BitApp.prototype.tick = bit_noop;
BitApp.prototype.render = bit_noop;
BitApp.prototype.postProcess = bit_noop;
BitApp.prototype.overlay = bit_noop;
BitApp.prototype.pixelShader = bit_noop;