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
    }
};

var BitObject = {
    mixins: null,

    /** Returns a new BitObject. */
    create: function () {
        var newObject = Object.create(this);
        this._construct.apply(newObject, arguments);
        return newObject;
    },

    /** Returns a new BitObject with new and overridden properties.
     *  Optional mixins array can be provided, with highest priority last.
     * */
    extend: function (props, descriptors, mixins) {
        var newObject = Object.create(this), name, propNames, i, j;

        descriptors = descriptors || {};
        if (props) {
            propNames = Object.getOwnPropertyNames(props);
            i = propNames.length;
            while (i--) {
                name = propNames[i];
                if (!descriptors.hasOwnProperty(name)) {
                    newObject[name] = props[name];
                }
            }
        }
        if (mixins) {
            newObject.mixins = [];
            i = mixins.length;
            while (i--) {
                newObject.mixins.push(mixins[i]);
                if (mixins[i].mixins) {
                    j = mixins[i].mixins.length;
                    while (j--) {
                        if ($bit_global.bit_util.arrayIndexOf(newObject.mixins, mixins[i].mixins[j]) === -1) {
                            newObject.mixins.push(mixins[i].mixins[j]);
                        }
                    }
                }
                propNames = Object.getOwnPropertyNames(mixins[i]);
                j = propNames.length;
                while (j--) {
                    name = propNames[j];
                    if (!newObject.hasOwnProperty(name)) {
                        newObject[name] = mixins[i][name];
                    }
                }
            }
        }
        if (this.mixins) {
            i = this.mixins.length;
            while (i--) {
                if ($bit_global.bit_util.arrayIndexOf(newObject.mixins, this.mixins[i]) === -1) {
                    newObject.mixins.push(this.mixins[i]);
                }
            }
        }
        Object.defineProperties(newObject, descriptors);

        return newObject;
    },

    _construct: $bit_global.bit_noop,

    _constructMixin: function (mixin, args) {
        if ($bit_global.bit_util.arrayIndexOf(this.mixins, mixin) !== -1) {
            mixin._construct.apply(this, args);
        }
    },

    _super: function (obj, method, args) {
        return Object.getPrototypeOf(obj)[method].apply(this, args);
    }
};


var bit_math = {
    /** Returns dot product of given sequences. */
    dot: function (a, b) {
        var n = 0, i = Math.min(a.length, b.length);
        while (i--) {
            n += a[i] * b[i];
        }
        return n;
    }
};


var BitEntityManager = BitObject.extend({
    entities: null,

    /** Adds a new entity. */
    addEntity: function (entity) {
        this.entities = this.entities || [];
        entity.parent = this;
        this.entities.push(entity);
    },

    /** Removes a contained entity. */
    removeEntity: function (entity) {
        if (this.entities) {
            bit_util.arrayRemove(this.entities, entity);
            entity.parent = null;
        }
    },

    /** Calls tick function on each entity. */
    tick: function (app, canvas, screen) {
        var i = this.entities ? this.entities.length : 0;
        while (i--) {
            this.entities[i].tick();
        }
    },

    /** Calls render function on each entity. */
    render: function (app, canvas, screen) {
        var i = this.entities ? this.entities.length : 0;
        while (i--) {
            this.entities[i].render();
        }
    },

    /** Returns true if instance has child entities. */
    hasChildren: function () { return this.entities && this.entities.length > 0; }
});


var BitEvent = BitObject.extend({
    name: null,
    type: 'BitEvent',
    notifier: null,

    _construct: function (name, notifier) {
        this.name = name;
        this.notifier = notifier || null;
    }
},  { qualifiedName: { get: function () { return this.type + '.' + (this.name || 'UNDEFINED'); } } });


var BitEventHandler = BitObject.extend({
    handleEvent: function (event) {
        throw new Error("BitEventHandler.handleEvent: No implementation for abstract method defined");
    }
});

var BitEventNotifier = BitObject.extend({
    _handlers: [],

    addHandler: function (handler, qualifiedEventName) {
        var eventHandlers = this._handlers[qualifiedEventName] = this._handlers[event.qualifiedName] || [];

        if (bit_util.arrayIndexOf(eventHandlers, qualifiedEventName) === -1) {
            eventHandlers.push(handler);
        }
    },

    handleEvent: function (event) {
        var eventHandlers = this._handlers[event.qualifiedName],
            i = eventHandlers ? eventHandlers.length : 0,
            handler;

        while (i--) {
            handler = eventHandlers[i];
            if (handler.handleEvent(event)) {
                bit_util.arrayRemove(eventHandlers, event.qualifiedName);
            }
        }
    }
}, null, [BitEventHandler]);

var BitEntity = BitObject.extend({
    active: true,
    parent: null
}, null, [BitEventHandler, BitEntityManager]);

var BitVector2D = BitObject.extend({
    x: 0,
    y: 0,

    _construct: function (x, y) {
        this.x = x || this.x;
        this.y = y || this.y;
    },

    cross: function (vector) {
        return this.x * vector.y + this.y * vector.x;
    },
    dot: function (vector) {
        return this.x * vector.x + this.y * vector.y;
    },
    length: function () {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    },
    normalize: function () {
        var normalVector = BitVector2D.create(),
            length = this.length();
        if (length > 0) {
            normalVector.x /= length;
            normalVector.y /= length;
        }
        return normalVector;
    }
});

var BitDimensions = BitObject.extend({
    width: 0,
    height: 0,

    _construct: function (width, height) {
        this.width = width || this.width;
        this.height = height || this.height;
    }
});

var BitRectangle = BitObject.extend({
    _construct: function (x, y, width, height) {
        this._constructMixin(BitVector2D, [x, y]);
        this._constructMixin(BitDimensions, [width, height]);
    }
}, null, [BitVector2D, BitDimensions]);


var BitColor = new BitObject.extend({
    AMASK: bit_util.isLittleEndian() ? 0xFF000000 : 0x000000FF,
    BMASK: bit_util.isLittleEndian() ? 0x00FF0000 : 0x0000FF00,
    GMASK: bit_util.isLittleEndian() ? 0x0000FF00 : 0x00FF0000,
    RMASK: bit_util.isLittleEndian() ? 0x000000FF : 0xFF000000,
    RGBMASK: bit_util.isLittleEndian() ? 0x00FFFFFF : 0xFFFFFF00,
    ASHIFT: bit_util.isLittleEndian() ? 24 : 0,
    BSHIFT: bit_util.isLittleEndian() ? 16 : 8,
    GSHIFT: bit_util.isLittleEndian() ? 8 : 16,
    RSHIFT: bit_util.isLittleEndian() ? 0 : 24,

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
    }

});


var BitBuffer = BitObject.extend({
    width: 0,
    height: 0,
    canvas: null,
    canvasCtx: null,
    data: null,
    dataLUT: null,

    _canvasCtxImageData: null,
    _buf: null,
    _buf8: null,

    _construct: function (width, height) {
        this.width = width || this.width;
        this.height = height || this.height;

        this.dataLUT = this._buildLUT(this.width, this.height);

        this.canvas = document.createElement('canvas');
        this.canvas.id = 'bit_buffer_' + new Date().getTime().toString();
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.canvasCtx = this.canvas.getContext('2d');
        this.canvasCtx.imageSmoothingEnabled = false;
        this.canvasCtx.webkitImageSmoothingEnabled = false;
        this.canvasCtx.mozImageSmoothingEnabled = false;
        this._canvasCtxImageData = this.canvasCtx.createImageData(this.width, this.height);
        this._buf = new ArrayBuffer(this._canvasCtxImageData.data.length);
        this._buf8 = new Uint8ClampedArray(this._buf);
        this.data = new Uint32Array(this._buf);
    },

    _buildLUT: function (xCount, yCount) {
        var x, y, lut = [];
        lut.length = xCount;
        for (x = 0; x < xCount; x++) {
            lut[x] = [];
            lut[x].length = yCount;
            for (y = 0; y < yCount; y++) {
                lut[x][y] = (x + y * xCount);
            }
        }

        return lut;
    },

    /** Clears render data. */
    clear: function (color) {
        var i = this.data.length;
        while (i--) {
            this.data[i] = color;
        }
    },

    /**  Sets data value for a single pixel. */
    putPixel: function (x, y, r, g, b, a) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) { return; }

        this.data[this.dataLUT[x][y]] = a << this.ASHIFT | b << this.BSHIFT | g << this.GSHIFT | r << this.RSHIFT;

        this._app.pixelShader();
    },

    /** Draws source data to render data using source-alpha blending. */
    blit: function (sprite, x, y) {
        var $data = sprite.data,
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
                if (bx < 0 || by < 0 || bx >= this.width || by >= this.height) { continue; }
                offset = (dx + dy * spriteWidth);
                if ($data[offset] >> this.ASHIFT & this.AMASK) {
                    this.data[this.dataLUT[bx][by]] = this.blendColors($data[offset], this.data[this.dataLUT[bx][by]]) | this.AMASK;
                }
            }
            dy = spriteHeight;
            by = y + spriteHeight;
        }
    },

    /** Draws source data to render data forcing fixed 0xFF alpha. */
    blitNoAlpha: function (sprite, x, y) {
        var $data = sprite.data,
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
                if (bx < 0 || bx >= this.width || by < 0 || by >= this.height) { continue; }
                this.data[this.dataLUT[bx][by]] = $data[(dx + dy * spriteWidth)] | BitColor.AMASK;
            }
            dy = spriteHeight;
            by = y + spriteHeight;
        }
    },

    /** Draws a line to render data using Bresenham's algorithm. */
    drawLine: function (x0, y0, x1, y1, color) {
        var dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1,
            dy = Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1,
            err = (dx > dy ? dx : -dy) >> 1,
            e2 = err;

        while (true) {
            if (x0 >= 0 && y0 >= 0 && x0 < this.width && y0 < this.height) {
                this.data[this.dataLUT[x0][y0]] = color;
            }
            if (x0 === x1 && y0 === y1) { break; }
            if (e2 > -dx) { err -= dy; x0 += sx; }
            if (e2 < dy) { err += dx; y0 += sy; }
        }
    },

    /** Draws an unfilled rectangle to render data. */
    drawRect: function (x, y, width, height, color) {

    },

    /** Draws a filled rectangle to render data. */
    fillRect: function (x, y, width, height, color) {
        var x1 = Math.max(0, x),
            y1 = Math.max(0, y),
            x2 = Math.min(this.width, x + width),
            y2 = Math.min(this.height, y + height),
            bx = x2,
            by = y2;

        while (bx-- > x1) {
            while (by-- > y1) {
                this.data[this.dataLUT[bx][by]] = BitColor.blendColors(color, this.data[this.dataLUT[bx][by]]) | this.AMASK;
            }
            by = y2;
        }
    }
});


var BitScreen = BitObject.extend({

    _construct: function (width, height) {
        this._constructMixin(BitRectangle, [0, 0, width, height]);
        this._constructMixin(BitEntityManager);
        this._constructMixin(BitBuffer);
    },

    tick: function (app, canvas) {
        var i = this.entities ? this.entities.length : 0;
        while (i--) {
            this.entities[i].tick(app, canvas, this);
        }
    },

    render: function (app, canvas) {
        var i = this.entities ? this.entities.length : 0;
        while (i--) {
            this.entities[i].render(app, canvas, this);
        }
        this._canvasCtxImageData.data.set(this._buf8);
        this.canvasCtx.putImageData(this._canvasCtxImageData, 0, 0);
    }
}, null, [BitRectangle, BitEntityManager, BitBuffer]);


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

        //this.backBufferCtxImageDataData.set(this._buf8);
    },

    addScreen: function (screen) {
        this.addEntity(screen);
    },

    removeScreen: function (screen) {
        this.removeEntity(screen);
    }
},  { screens: { get: function () { return this.entities; } } }, [BitEntityManager]);


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
    lastTick: Date.now(),

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
        self.lastTick = Date.now();
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
            this.canvasCtx.drawImage(this.backBufferCanvas, 0, 0);
        } else {
            this.canvasCtx.putImageData(this.backBufferCtxImageData, 0, 0);
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

        this.bufferLUT = bit_util.buildXYLUT(this.width, this.height);

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
            this.canvas = document.createElement('canvas');
            this.canvas.id = 'bit_frameBuffer_' + new Date().getTime().toString();
            this.canvas.width = this.width * this.scale;
            this.canvas.height = this.height * this.scale;
            this.canvas.style.backgroundColor = 'rgb(0,0,0)';
            this.canvasCtx = this.canvas.getContext('2d');
            this.canvasCtx.imageSmoothingEnabled = false;
            this.canvasCtx.webkitImageSmoothingEnabled = false;
            this.canvasCtx.mozImageSmoothingEnabled = false;
            this.canvasCtx.setTransform(this.scale, 0, 0, this.scale, 0, 0);

        } else {
            this.canvas = this.backBufferCanvas;
            this.canvasCtx = this.backBufferCtx;
        }

        this._parentElement.appendChild(this.canvas);

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

    /** Clears render data. */
    clear: function (color) {
        var i = this.buffer.length;
        while (i--) {
            this.buffer[i] = color;
        }
    },

    /**  Sets data value for a single pixel. */
    putPixel: function (x, y, r, g, b, a) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) { return; }

        this.buffer[this.bufferLUT[x][y]] = a << this.ASHIFT | b << this.BSHIFT | g << this.GSHIFT | r << this.RSHIFT;

        this._app.pixelShader();
    },

    /** Draws source data to render data using source-alpha blending. */
    blit: function (sprite, x, y) {
        var $data = sprite.data,
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
                if (bx < 0 || by < 0 || bx >= this.width || by >= this.height) { continue; }
                offset = (dx + dy * spriteWidth);
                if ($data[offset] >> this.ASHIFT & this.AMASK) {
                    this.buffer[this.bufferLUT[bx][by]] = this.blendColors($data[offset], this.buffer[this.bufferLUT[bx][by]]) | this.AMASK;
                }
            }
            dy = spriteHeight;
            by = y + spriteHeight;
        }
    },

    /** Draws source data to render data forcing fixed 0xFF alpha. */
    blitNoAlpha: function (sprite, x, y) {
        var $data = sprite.data,
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
                if (bx < 0 || bx >= this.width || by < 0 || by >= this.height) { continue; }
                this.buffer[this.bufferLUT[bx][by]] = $data[(dx + dy * spriteWidth)] | this.AMASK;
            }
            dy = spriteHeight;
            by = y + spriteHeight;
        }
    },

    /** Draws a line to render data using Bresenham's algorithm. */
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

    /** Draws an unfilled rectangle to render data. */
    drawRect: function (x, y, width, height, color) {

    },

    /** Draws a filled rectangle to render data. */
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



var BitSpriteEntity = BitEntity.extend({
    buffer: null,
    frameCount: 0,
    velocity: null,

    _construct: function (buffer) {
        if (buffer) {
            this._constructMixin(BitRectangle, [0, 0, buffer.width, buffer.height]);
            this.buffer = buffer;
        }
        this.velocity = BitVector2D.create();
    },

    tick: function () {
        this.x += this.velocity.x;
        this.y += this.velocity.y;
    },

    render: function (app, canvas, screen) {
        screen.blitNoAlpha(this.buffer, this.x, this.y);
    }
}, null, [BitRectangle]);


var BitApp = BitObject.extend({
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

    _construct: function () {
        this._constructMixin(BitEventNotifier);
        this._constructMixin(BitEntityManager);
        this.init();
    },

    init: $bit_global.bit_noop,

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