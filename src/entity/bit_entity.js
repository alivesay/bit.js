/*jslint bitwise: true, browser: true, continue: true, nomen: true, plusplus: true, node: true */
/*global bit, BitEntityContainerMixin, BitObject */
/*global goog */

'use strict';

goog.provide('bit.entity.BitEntity');
goog.require('bit.core.bit_namespace');
goog.require('bit.core.BitObject');
goog.require('bit.entity.BitEntityContainerMixin');

BitObject.extend('bit.core.BitEntity', {
    id: null,
    parent: null,
    active: true,
    components: null,

    _entityManager: null,

    _construct: function (id, entityManager) {
        this.id = id || this.id;
        this.components = [];
        this._entityManager = entityManager || this._entityManager;
    },

    addComponent: function (component) {
        this.components[component._className] = component;
        this._entityManager.mapComponentEntity(this.id, component._className);
        return this;
    },

    removeComponent: function (component) {
        delete this.components[component._className];
        this._entityManager.unmapComponentEntity(this.id, component._className);
        return this;
    },

    getComponent: function (componentClassName) {
        return this._components[componentClassName];
    }
}, null, [BitEntityContainerMixin]);