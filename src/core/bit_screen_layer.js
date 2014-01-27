/*jslint bitwise: true, browser: true, continue: true, nomen: true, plusplus: true, node: true */
/*global bit, BitEntityContainerMixin, BitObject, BitRectangleMixin, BitVector2D */
/*global goog */

'use strict';

goog.provide('bit.core.BitScreenLayer');
goog.require('bit.core.bit_namespace');
goog.require('bit.entity.BitEntityContainerMixin');

BitObject.extend('bit.core.BitScreenLayer', {
    _parallax: 0,
    _width: 0,
    _height: 0,
    _x: 0,
    _y: 0,

    _construct: function (width, height) {
        this._width = width || this._width;
        this._height = height || this._height;
    },

    // TODO: use object.keys() instead
    tick: function (app, canvas, screen) {
        var id;
        for (id in this.entities) {
            if (this.entities.hasOwnProperty(id)) {
                this.entities[id].tick(app, canvas, screen, this);
            }
        }
    },

    render: function (app, canvas, screen) {
        var id;
        for (id in this.entities) {
            if (this.entities.hasOwnProperty(id)) {
                this.entities[id].render(app, canvas, screen, this);
            }
        }
    }
}, null, [BitEntityContainerMixin]).addAttributes({
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

    width: {
        meta: {
            type: 'number'
        },
        get: function () {
            return this._width;
        },

        set: function (width) {
            this._width = width;
            this._resize(width, this._height);
        }
    },

    height: {
        meta: {
            type: 'number'
        },
        get: function () {
            return this._height;
        },

        set: function (height) {
            this._height = height;
            this._resize(this._width, height);
        }
    }
});