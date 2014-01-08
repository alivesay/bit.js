/*jslint bitwise: true, browser: true, continue: true, nomen: true, plusplus: true, node: true */
/*global bit, BitEntityContainerMixin, BitObject, BitRectangleMixin, BitVector2D */
/*global goog */

'use strict';

goog.provide('bit.core.BitScreenLayer');
goog.require('bit.core.bit_namespace');
goog.require('bit.core.BitEntityContainerMixin');
goog.require('bit.core.BitRectangle');
goog.require('bit.core.BitVector2D');

BitObject.extend('bit.core.BitScreenLayer', {
    DEFAULT_LAYER_ID: "DefaultLayer",

    id: null,
    parallax: 0,

    _construct: function (id, width, height) {
        this.id = id;
        this.width = width;
        this.height = height;
    },

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
}, null, [BitRectangleMixin, BitEntityContainerMixin]);