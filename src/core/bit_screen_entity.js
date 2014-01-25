/*jslint bitwise: true, browser: true, continue: true, nomen: true, plusplus: true, node: true */
/*global bit, BitEntity, BitRectangleMixin, BitVector2D */
/*global goog */

'use strict';

goog.provide('bit.core.BitScreenEntity');
goog.require('bit.core.bit_namespace');
goog.require('bit.core.BitRectangleMixin');
goog.require('bit.core.BitVector2D');
goog.require('bit.entity.BitEntity');

// TODO: can contain entities?
// TODO: remove all entity references from core classes

BitEntity.extend('bit.core.BitScreenEntity', {
    buffer: null,
    frameCount: 0,
    velocity: null,

    _construct: function (id, buffer) {
        this._constructSuper(BitEntity, [id]);

        if (buffer) {
            this.setWidth(buffer.getWidth());
            this.setHeight(buffer.getHeight());
            this.buffer = buffer;
        }
        this.velocity = BitVector2D.create(0, 0);
    },

    tick: function (app, canvas, screen, layer) {
        this.x += this.velocity.getX();
        this.y += this.velocity.getY();
    },

    render: function (app, canvas, screen, layer) {
        screen.buffer.blitNoAlpha(this.buffer, this.getX(), this.getY());
    }
}, null, [BitRectangleMixin]);