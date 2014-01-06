/*jslint bitwise: true, browser: true, continue: true, nomen: true, plusplus: true, node: true */
/*global bit, BitEntity, BitRectangle, BitVector2D */
/*global goog */

'use strict';

goog.provide('bit.core.BitScreenLayer');
goog.require('bit.core.bit_namespace');
goog.require('bit.core.BitEntity');
goog.require('bit.core.BitRectangle');
goog.require('bit.core.BitVector2D');

BitEntity.extend('bit.core.BitScreenLayer', {
    DEFAULT_LAYER_ID: "DefaultLayer",

    parallax: 0,

    _construct: function (id, width, height) {
        this._constructSuper(BitEntity, [id]);

        this._constructMixin(BitRectangle, [0, 0, width, height]);
    },

    tick: function (app, canvas, screen) {
        var id;
        for (id in this.entities) {
            this.entities[id].tick(app, canvas, screen, this);
        }
    },

    render: function (app, canvas, screen) {
        var id;
        for (id in this.entities) {
            this.entities[id].render(app, canvas, screen, this);
        }
    }
}, null, [BitRectangle]);