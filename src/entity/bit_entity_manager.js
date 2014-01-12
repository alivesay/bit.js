/*jslint bitwise: true, browser: true, continue: true, nomen: true, plusplus: true, node: true */
/*global bit, BitEntity, BitObject, BitUtil */
/*global goog */

'use strict';

goog.provide('bit.entity.BitEntityManager');
goog.require('bit.core.bit_namespace');
goog.require('bit.core.BitObject');

BitObject.extend('bit.core.BitEntityManager', {

    _entities: null,
    _components: null,
    _componentEntityClassMap: null,
    _nextEntityID: 0,

    _construct: function () {
        this._entities = {};
        this._components = {};
    },

    generateEntityID: function () {
        var i;

        if (this._nextEntityID < Number.MAX_VALUE) {
            return this._nextEntityID++;
        }

        for (i = 0; i > Number.MAX_VALUE; i++) {
            if (this._entities[i] === undefined) {
                return i;
            }
        }

        throw new Error('BitEntityManager.createEntityID: No entity IDs available');
    },

    // TODO: use entity object pool
    createEntity: function () {
        var id = this.generateEntityID(),
            entity = BitEntity.create(id, this);

        if (this._entities[id] === undefined) {
            throw new Error('BitEntityManager.createEntity: Entity already exists');
        }

        this._entities[id] = entity;

        return entity;
    },

    registerComponent: function (component) {
        if (this._components[component.className] === undefined) {
            throw new Error('BitEntityManager.registerComponent: Component ' + component.className + ' already exists');
        }

        this._components[component.className] = component;
        this._componentEntityClassMap[component.className] = {};

        return this;
    },

    deregisterComponent: function (component) {
        delete this._components[component.className];
        delete this._componentEntityClassMap[component.className];

        return this;
    },

    mapComponentEntity: function (id, className) {
        this._componentEntityClassMap[className][id] = this._components[className];
    },

    unmapComponentEntity: function (id, className) {
        delete this._componentEntityClassMap[className][id];
    },



    getComponentOfClassForEntity: function (className, entity) {
        return this._components[className][entity.id];
    },

    getEntitiesWithComponent: function (componentClassName) {
        var components = this._components[componentClassName],
            entitiesWithComponent = [],
            component;

        if (components !== undefined && components !== null) {
            for (component in components) {
                if (components.hasOwnProperty(component)) {
                    entitiesWithComponent.push(component);
                }
            }
        }

        return entitiesWithComponent;
    },

    removeEntity: function (entity) {
        var component;

        for (component in this._components) {
            if (this._components.hasOwnProperty(component)) {
                delete component[entity.id];
            }
        }
        delete this._entities[entity.id];
    }
});