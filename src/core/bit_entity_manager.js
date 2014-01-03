/*jslint bitwise: true, browser: true, continue: true, nomen: true, plusplus: true, node: true */
/*global BitObject, BitUtil */
/*global goog */

'use strict';

goog.provide('bit.core.BitEntityManager');
goog.require('bit.core.BitObject');
goog.require('bit.core.BitUtil');

var BitEntityManager = BitObject.extend('BitEntityManager', {
    entities: null,

    /** Adds a new entity. */
    addEntity: function (entity, id) {
        this.entities = this.entities || [];
        entity.id = id || null;
        entity.parent = this;
        this.entities.push(entity);
    },

    /** Removes a contained entity. */
    removeEntity: function (entity) {
        if (this.entities) {
            BitUtil.arrayRemove(this.entities, entity);
            entity.parent = null;
        }
    },

    /** Calls tick function on each entity. */
    tick: function (app, canvas, screen) {
        var i = this.entities ? this.entities.length : 0;
        while (i--) {
            this.entities[i].tick(app, canvas, screen);
        }
    },

    /** Calls render function on each entity. */
    render: function (app, canvas, screen) {
        var i = this.entities ? this.entities.length : 0;
        while (i--) {
            this.entities[i].render(app, canvas, screen);
        }
    },

    /** Returns true if instance has child entities. */
    hasChildren: function () { return this.entities && this.entities.length > 0; }
});