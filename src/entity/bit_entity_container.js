/*jslint bitwise: true, browser: true, continue: true, nomen: true, plusplus: true, node: true */
/*global bit, BitEntityContainerMixin, BitObject, BitUtil */
/*global goog */

'use strict';

goog.provide('bit.entity.BitEntityContainer');
goog.provide('bit.entity.BitEntityContainerMixin');
goog.require('bit.core.bit_namespace');
goog.require('bit.core.BitObject');
goog.require('bit.core.BitUtil');

BitObject.extend('bit.core.BitEntityContainerMixin', {
    entities: null,

    /** Adds a new entity. */
    addEntity: function (entity) {
        this.entities = this.entities || [];
        entity.parent = this;
        this.entities[entity.id] = entity;
    },

    /** Removes a contained entity. */
    removeEntity: function (entity) {
        if (this.entities) {
            entity.parent = null;
            delete this.entities[entity.id];
        }
    },

    /** Removes a contained entity by ID. */
    removeEntityByID: function (id) {
        if (this.entities && this.entities.hasOwnProperty(id)) {
            this.entities[id].parent = null;
            delete this.entities[id];
        }
    },

    /** Calls tick function on each entity. */
    tick: function (app, canvas, screen, layer) {
        var id;
        for (id in this.entities) {
            if (this.entities.hasOwnProperty(id)) {
                this.entities[id].tick(app, canvas, screen, layer);
            }
        }
    },

    /** Calls render function on each entity. */
    render: function (app, canvas, screen, layer) {
        var id;
        for (id in this.entities) {
            if (this.entities.hasOwnProperty(id)) {
                this.entities[id].render(app, canvas, screen, layer);
            }
        }
    },

    /** Returns true if instance has child entities. */
    hasChildren: function () { return this.entities && this.entities.length > 0; }
});

BitObject.extend('bit.core.BitEntityContainer', {}, null, [BitEntityContainerMixin]);