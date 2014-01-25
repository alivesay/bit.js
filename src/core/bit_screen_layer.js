/*jslint bitwise: true, browser: true, continue: true, nomen: true, plusplus: true, node: true */
/*global bit, BitEntityContainerMixin, BitObject, BitRectangleMixin, BitVector2D */
/*global goog */

'use strict';

goog.provide('bit.core.BitScreenLayer');
goog.require('bit.core.bit_namespace');
goog.require('bit.entity.BitEntityContainerMixin');
goog.require('bit.core.BitRectangleMixin');

BitObject.extend('bit.core.BitScreenLayer', {
    parallax: 0,

    _construct: function (width, height) {
        this.setWidth(width || this.getWidth());
        this.setHeight(height || this.getHeight());
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