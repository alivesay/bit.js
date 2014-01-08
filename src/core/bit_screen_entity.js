/*jslint bitwise: true, browser: true, continue: true, nomen: true, plusplus: true, node: true */
/*global bit, BitEntity, BitRectangleMixin, BitVector2D */
/*global goog */

'use strict';

goog.provide('bit.core.BitScreenEntity');
goog.require('bit.core.bit_namespace');
goog.require('bit.core.BitEntity');
goog.require('bit.core.BitRectangleMixin');
goog.require('bit.core.BitVector2D');

// TODO: can contain entities?

BitEntity.extend('bit.core.BitScreenEntity', {
    buffer: null,
    frameCount: 0,
    velocity: null,

    _construct: function (id, buffer) {
        this._constructSuper(BitEntity, [id]);

        if (buffer) {
            this.width = buffer.width;
            this.height = buffer.height;
            this.buffer = buffer;
        }
        this.velocity = BitVector2D.create(0, 0);
    },

    tick: function (app, canvas, screen, layer) {
        this.x += this.velocity.x;
        this.y += this.velocity.y;
    },

    render: function (app, canvas, screen, layer) {
        screen.buffer.blitNoAlpha(this.buffer, this.x, this.y);
    }
}, null, [BitRectangleMixin]);