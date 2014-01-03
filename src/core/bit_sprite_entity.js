/*jslint bitwise: true, browser: true, continue: true, nomen: true, plusplus: true, node: true */
/*global BitEntity, BitRectangle, BitVector2D */
/*global goog */

'use strict';

goog.provide('bit.core.BitSpriteEntity');
goog.require('bit.core.BitEntity');
goog.require('bit.core.BitRectangle');
goog.require('bit.core.BitVector2D');

var BitSpriteEntity = BitEntity.extend('BitSpriteEntity', {
    buffer: null,
    frameCount: 0,
    velocity: null,

    _construct: function (buffer) {
        if (buffer) {
            this._constructMixin(BitRectangle, [0, 0, buffer.width, buffer.height]);
            this.buffer = buffer;
        }
        this.velocity = BitVector2D.create(0, 0);
    },

    tick: function () {
        this.x += this.velocity.x;
        this.y += this.velocity.y;
    },

    render: function (app, canvas, screen) {
        screen.blitNoAlpha(this.buffer, this.x, this.y);
    }
}, null, [BitRectangle]);