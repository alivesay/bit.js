/*jslint bitwise: true, browser: true, continue: true, nomen: true, plusplus: true, node: true */
/*global bit, BitObject, BitVector2D, BitVector2DMixin */
/*global goog */

'use strict';

goog.provide('bit.core.BitVector2D');
goog.provide('bit.core.BitVector2DMixin');
goog.require('bit.core.bit_namespace');
goog.require('bit.core.BitObject');

BitObject.extend('bit.core.BitVector2DMixin', {
    _x: 0,
    _y: 0,

    getX: function () {
        return this._x;
    },

    setX: function (x) {
        this._x = x;
    },

    getY: function () {
        return this._y;
    },

    setY: function (y) {
        this._y = y;
    },

    cross: function (vector) {
        return this.getX() * vector.getY() + this.getY() * vector.getX();
    },

    dot: function (vector) {
        return this.getX() * vector.getX() + this.getY() * vector.getY();
    },

    length: function () {
        return Math.sqrt(this.getX() * this.getX() + this.getY() * this.getY());
    },

    normalize: function () {
        var normalVector = BitVector2D.create(),
            length = this.length();
        if (length > 0) {
            normalVector.setX(normalVector.getX() / length);
            normalVector.setY(normalVector.getY() / length);
        }
        return normalVector;
    },

    invertX: function () {
        this.setX(-this.getX());
    },

    invertY: function () {
        this.setY(-this.getY());
    },

    invert: function () {
        this.invertX();
        this.invertY();
    }
});

BitObject.extend('bit.core.BitVector2D', {
    _construct: function (x, y) {
        this.setX(x || this.getX());
        this.setY(y || this.getY());
    }
}, null, [BitVector2DMixin]);