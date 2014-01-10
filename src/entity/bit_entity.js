/*jslint bitwise: true, browser: true, continue: true, nomen: true, plusplus: true, node: true */
/*global bit, BitEntityContainerMixin, BitObject */
/*global goog */

'use strict';

goog.provide('bit.entity.BitEntity');
goog.require('bit.core.bit_namespace');
goog.require('bit.core.BitEntityContainerMixin');
goog.require('bit.core.BitObject');

BitObject.extend('bit.core.BitEntity', {
    id: null,
    parent: null,
    active: true,
    components: [],

    _entityManager: null,

    _construct: function (id, entityManager) {
        this.id = id || this.id;
        this._entityManager = entityManager || this._entityManager;
    },

    addComponent: function (component) {
        this.components[component.className] = component;
        this._entityManager.mapEntityComponent(this.id, component.className);
        return this;
    },

    removeComponent: function (component) {
        delete this.components[component.className];
        this._entityManager.unmapEntityComponent(this.id, component.className);
        return this;
    },

    getComponent: function (componentClassName) {
        return this._components[componentClassName];
    }
}, null, [BitEntityContainerMixin]);