/*jslint bitwise: true, browser: true, continue: true, nomen: true, plusplus: true, node: true */
/*global bit, BitObject, BitUtil */
/*global goog */

'use strict';

goog.provide('bit.core.BitEntityManager');
goog.require('bit.core.bit_namespace');
goog.require('bit.core.BitObject');
goog.require('bit.core.BitUtil');


BitObject.extend('bit.core.BitEntityManager', {
    entities: null,

    _construct: function () {
        this.entities = {};
    },

    /** Adds a new entity. */
    addEntity: function (entity) {
        entity.parent = this;
        this.entities[entity.id] = entity;
    },

    /** Removes a contained entity. */
    removeEntity: function (entity) {
        entity.parent = null;
        delete this.entities[entity.id];
    },

    /** Removes a contained entity by ID. */
    removeEntityByID: function (id) {
        if (this.entities.hasOwnProperty(id)) {
            this.entities[id].parent = null;
            delete this.entities[id];
        }
    },

    /** Calls tick function on each entity. */
    tick: function (app, canvas, screen) {
        var id;
        for (id in this.entities) {
            app.entities[id].tick(app, canvas, screen);
        }
    },

    /** Calls render function on each entity. */
    render: function (app, canvas, screen) {
        var id;
        for (id in this.entities) {
            app.entities[id].render(app, canvas, screen);
        }
    },

    /** Returns true if instance has child entities. */
    hasChildren: function () { return this.entities && this.entities.length > 0; }
});