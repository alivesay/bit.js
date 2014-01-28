/*jslint bitwise: true, browser: true, continue: true, nomen: true, plusplus: true, node: true */
/*global bit, BitEntity, BitVector2D */
/*global goog */

'use strict';

goog.provide('bit.core.BitScreenEntity');
goog.require('bit.core.bit_namespace');
goog.require('bit.core.BitVector2D');
goog.require('bit.entity.BitEntity');

// TODO: can contain entities?
// TODO: remove all entity references from core classes

BitEntity.extend('bit.core.BitScreenEntity', {
    frameCount: 0,

    _velocity: null,
    _x: 0,
    _y: 0,
    _buffer: null,

    _construct: function (id, buffer) {
        this._constructSuper(BitEntity, [id]);

        if (buffer) {
            this._buffer = buffer;
        }
        this._velocity = BitVector2D.create();
    },

    tick: function (app, canvas, screen, layer) {
        this._x += this._velocity._x;
        this._y += this._velocity._y;
    },

    render: function (app, canvas, screen, layer) {
        screen.buffer.blitNoAlpha(this._buffer, this._x, this._y);
    }
}).addAttributes({
    width: {
        meta: {
            type: 'number'
        },
        get: function () {
            return this._buffer.width;
        }
    },
    height: {
        meta: {
            type: 'number'
        },
        get: function () {
            return this._buffer.height;
        }
    },
    x: {
        meta: {
            type: 'number'
        },
        get: function () {
            return this._x;
        },
        set: function (x) {
            this._x = x;
        }
    },
    y: {
        meta: {
            type: 'number'
        },
        get: function () {
            return this._y;
        },
        set: function (y) {
            this._y = y;
        }
    },
    buffer: {
        meta: {
            type: 'BitBuffer'
        },
        get: function () {
            return this._buffer;
        }
    },
    velocity: {
        meta: {
            type: 'BitVector2D'
        },
        get: function () {
            return this._velocity;
        }
    }
});