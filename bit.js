/*global ArrayBuffer, Uint8ClampedArray, Uint8Array, Uint32Array */
/*jslint bitwise: true, browser: true, continue: true, nomen: true, plusplus: true, node: true */

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
    /** Returns first index of value in array or -1. */
    arrayIndexOf: function (array, value) {
        var i, len = array.length;
        for (i = 0; i < len; i++) {
            if (array[i] === value) { return i; }
        }
        return -1;
    },

    /** Removes first occurrence of value in array if found. */
    arrayRemove: function (array, value) {
        var i = this.arrayIndexOf(array, value);
        if (i !== -1) { array.splice(i, 1); }
    },

    /** Returns true if little-endian architecture is detected. */
    isLittleEndian: function () {
        var buf = new ArrayBuffer(4),
            buf8 = new Uint8Array(buf),
            buf32 = new Uint32Array(buf);
        buf32[0] = 0xDEADBEEF;
        return (buf8[0] === 0xEF);
    },

    /** Returns a new object with new and overridden properties. */
    extendObject: function (obj, props) {
        var prop;
        for (prop in props) {
            if (props.hasOwnProperty(prop)) {
                obj[prop] = props[prop];
            }
        }
    }
};


var bit = {

    TICK_RATE: 1000 / 60,
    AMASK: 0xFF000000,
    BMASK: 0x00FF0000,
    GMASK: 0x0000FF00,
    RMASK: 0x000000FF,
    RGBMASK: 0x00FFFFFF,
    ASHIFT: 24,
    BSHIFT: 16,
    GSHIFT: 8,
    RSHIFT: 0,
    width: 0,
    height: 0,
    scale: 1,
    backBufferCanvas: null,
    backBufferCtx: null,
    backBufferCtxImageData: null,
    backBufferCtxImageDataData: null,
    screenBufferCanvas: null,
    screenBufferCtx: null,
    bufferLUT: null,

    $_window: window,
    $_bit_render: $bit_global.bit_noop,
    _parentElement: null,
    _app: null,
    _backBufferCtxImageData: null,
    _backBufferCtxImageDataDataBuffer: null,
    _buf: null,
    _buf8: null,
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

    _tick: function (self) {
        self._app.tick();
        self._lastTick = Date.now();
        self._timeoutID = setTimeout(function () { self._tick(self); }, self.TICK_RATE);
    },

    _render: function () {
        this._app.render();
        this._swapBuffer();

        this._fpsCounter.calc();

        if (this._running) {
            this._requestAnimationFrameID = this.$_window.requestAnimationFrame(this.$_bit_render);
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

    /** Initializes bit and adds canvas to parentElement. */
    init: function (parentElement, app, width, height, scale) {
        if (this._initialized === true) {
            throw new Error("bit.init: Already initialized");
        }

        this.$_bit_render = $bit_global._bit_render;
        this._parentElement = parentElement;
        this._app = app;
        this.width = width;
        this.height = height;
        this.scale = scale;

        if (!$bit_global.bit_util.isLittleEndian()) {
            this.AMASK = 0x000000FF;
            this.BMASK = 0x0000FF00;
            this.GMASK = 0x00FF0000;
            this.RMASK = 0xFF000000;
            this.RGBMASK = 0xFFFFFF00;
            this.ASHIFT = 0;
            this.BSHIFT = 8;
            this.GSHIFT = 16;
            this.RSHIFT = 24;
        }

        var x, y;
        this.bufferLUT = [];
        this.bufferLUT.length = this.width;
        for (x = 0; x < this.width; x++) {
            this.bufferLUT[x] = [];
            this.bufferLUT[x].length = this.height;
            for (y = 0; y < this.height; y++) {
                this.bufferLUT[x][y] = (x + y * this.width);
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

        this._parentElement.appendChild(this.screenBufferCanvas);

        this._app.init();

        this._initialized = true;
        this._running = false;
    },

    /** Starts rendering and logic tick. */
    start: function () {
        var self = this;

        if (this._running) {
            throw new Error('bit.run: Already running');
        }

        this._running = true;

        this._requestAnimationFrameID = this.$_window.requestAnimationFrame(this.$_bit_render);
        this._timeoutID = setTimeout(function () { self._tick(self); }, self.TICK_RATE);
    },

    /** Stops rendering and logic tick. */
    stop: function () {
        if (!this._running) {
            throw new Error('bit.stop: Already stopped');
        }

        this.$_window.cancelRequestAnimationFrame(this._requestAnimationFrameID);
        clearTimeout(this._timeoutID);
        this._running = false;
    },

    /** Returns integer color value from given RGB(A). */
    getColor: function (r, g, b, a) {
        return ((a === undefined ? 255 : a) << this.ASHIFT | b << this.BSHIFT | g << this.GSHIFT | r << this.RSHIFT) >>> 0;
    },

    /** Blends two colors using source-alpha blending. */
    blendColors: function (foregroundColor, backgroundColor) {
        var srcR = foregroundColor >> this.RSHIFT & 0xFF,
            srcG = foregroundColor >> this.GSHIFT & 0xFF,
            srcB = foregroundColor >> this.BSHIFT & 0xFF,
            srcA = foregroundColor >> this.ASHIFT & 0xFF,
            dstR = backgroundColor >> this.RSHIFT & 0xFF,
            dstG = backgroundColor >> this.GSHIFT & 0xFF,
            dstB = backgroundColor >> this.BSHIFT & 0xFF;

        return (srcA === 0) ? backgroundColor : (((srcR * srcA) + (dstR * (255 - srcA))) >> 8) << this.RSHIFT |
                                                (((srcG * srcA) + (dstG * (255 - srcA))) >> 8) << this.GSHIFT |
                                                (((srcB * srcA) + (dstB * (255 - srcA))) >> 8) << this.BSHIFT |
                                                srcA << this.ASHIFT;
    },

    /** Returns current rendered frames per second. */
    fps: function () { return this._fpsCounter.fps | 0; },

    /** Clears render buffer. */
    clear: function (color) {
        var i = this.buffer.length;
        while (i--) {
            this.buffer[i] = color;
        }
    },

    /**  Sets buffer value for a single pixel. */
    putPixel: function (x, y, r, g, b, a) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) { return; }

        this.buffer[this.bufferLUT[x][y]] = a << this.ASHIFT | b << this.BSHIFT | g << this.GSHIFT | r << this.RSHIFT;

        this._app.pixelShader();
    },

    /** Draws source buffer to render buffer using source-alpha blending. */
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
                if (bx < 0 || by < 0 || bx >= this.width || by >= this.height) { break; }
                offset = (dx + dy * spriteWidth);
                if ($data[offset] >> this.ASHIFT & this.AMASK) {
                    this.buffer[this.bufferLUT[bx][by]] = this.blendColors($data[offset], this.buffer[this.bufferLUT[bx][by]]) | this.AMASK;
                }
            }
            dy = spriteHeight;
            by = y + spriteHeight;
        }
    },

    /** Draws source buffer to render buffer forcing fixed 0xFF alpha. */
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
                this.buffer[this.bufferLUT[bx][by]] = $data[(dx + dy * spriteWidth)] | this.AMASK;
            }
            dy = spriteHeight;
            by = y + spriteHeight;
        }
    },

    /** Draws a line to render buffer using Bresenham's algorithm. */
    drawLine: function (x0, y0, x1, y1, color) {
        var dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1,
            dy = Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1,
            err = (dx > dy ? dx : -dy) >> 1,
            e2 = err;

        while (true) {
            if (x0 >= 0 && y0 >= 0 && x0 < this.width && y0 < this.height) {
                this.buffer[this.bufferLUT[x0][y0]] = color;
            }
            if (x0 === x1 && y0 === y1) { break; }
            if (e2 > -dx) { err -= dy; x0 += sx; }
            if (e2 < dy) { err += dx; y0 += sy; }
        }
    },

    /** Draws an unfilled rectangle to render buffer. */
    drawRect: function (x, y, width, height, color) {

    },

    /** Draws a filled rectangle to render buffer. */
    fillRect: function (x, y, width, height, color) {
        var x1 = Math.max(0, x),
            y1 = Math.max(0, y),
            x2 = Math.min(this.width, x + width),
            y2 = Math.min(this.height, y + height),
            bx = x2,
            by = y2;

        while (bx-- > x1) {
            while (by-- > y1) {
                this.buffer[this.bufferLUT[bx][by]] = this.blendColors(color, this.buffer[this.bufferLUT[bx][by]]) | this.AMASK;
            }
            by = y2;
        }
    }
};

/** A global bit._render() reference to avoid using an anonymous function with RAF. */
var _bit_render = function () {
    bit._render();
};

var BitEntity = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    xSpeed: 0,
    ySpeed: 0,

    tick: function () {
        this.x += this.xSpeed;
        this.y += this.ySpeed;
    },

    render: function () {
        bit.drawRect(this.x, this.y, this.width, this.height, bit.getColor(255, 0, 255));
    }
};


var BitEntityManager = {
    entities: [],

    /** Adds a new entity. */
    addEntity: function (entity) {
        this.entities.push(entity);
    },

    /** Removes a contained entity. */
    removeEntity: function (entity) {
        bit_util.arrayRemove(this.entities, entity);
    },

    /** Calls tick function on each entity. */
    tick: function () {
        var $len = this.entities.length, i;
        for (i = 0; i < $len; i++) {
            this.entities[i].tick();
        }
    },

    /** Calls render function on each entity. */
    render: function () {
        var $len = this.entities.length, i;
        for (i = 0; i < $len; i++) {
            this.entities[i].render();
        }
    }
};


var BitApp = {
    entityManager: Object.create(BitEntityManager),
    init: bit_noop,
    tick: function () { this.entityManager.tick(); },
    render: function () { this.entityManager.render(); },
    postProcess: bit_noop,
    overlay: bit_noop,
    pixelShader: bit_noop
};


var BitSprite = bit_util.extendObject(BitEntity, {
    buffer: null,
    frameCount: 0
});

