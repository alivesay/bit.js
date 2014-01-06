/*jslint bitwise: true, browser: true, continue: true, nomen: true, plusplus: true, node: true */
/*global bit, bit_global, bit_namespace, BitObject, bit_noop, BitUtil */
/*global goog */

'use strict';

goog.provide('bit.core.BitObject');
goog.require('bit.core.bit_namespace');
goog.require('bit.core.BitUtil');
goog.require('bit.core.bit_noop');

bit.core.BitObject = {
    mixins: null,
    classNamespace: 'bit.core',
    className: 'BitObject',
    instanceID: 0,

    _validPropertyTypes: ['function', 'string', 'number', 'boolean'],
    _superClass: null,

    generateID: function () {
        return ++BitObject.instanceID;
    },

    create: function () {
        var newObject = Object.create(this);
        newObject.instanceID = this.generateID();
        this._construct.apply(newObject, arguments);
        return newObject;
    },

    extend: function (name, props, descriptors, mixins, addGlobal) {
        var newObject = Object.create(this), propName, propNames, namespaces, i, j;
        descriptors = descriptors || {};
        addGlobal = addGlobal || true;

        namespaces = name.split('.');
        newObject.className = namespaces.pop();
        if (namespaces.length > 0) {
            bit_namespace(bit_global, namespaces.join('.'));
            namespaces.reduce(function (obj, i) { return obj[i]; }, bit_global);
        }
        this.classNamespace = namespaces.join('.');

        if (addGlobal) { bit_global[newObject.className] = newObject; }

        if (props) {
            propNames = Object.getOwnPropertyNames(props);
            i = propNames.length;
            while (i--) {
                propName = propNames[i];
                if (!descriptors.hasOwnProperty(propName)) {
                    if (!BitObject._isValidPropertyType(props[propName])) {
                        throw new Error('BitObject.extend: Invalid field type for property [' + propName + ']');
                    }
                    newObject[propName] = props[propName];
                }
            }
        }
        if (mixins) {
            newObject.mixins = [];
            i = mixins.length;
            while (i--) {
                newObject.mixins.push(mixins[i]);
                if (mixins[i].mixins) {
                    j = mixins[i].mixins.length;
                    while (j--) {
                        if (BitUtil.arrayIndexOf(newObject.mixins, mixins[i].mixins[j]) === -1) {
                            newObject.mixins.push(mixins[i].mixins[j]);
                        }
                    }
                }
                propNames = Object.getOwnPropertyNames(mixins[i]);
                j = propNames.length;
                while (j--) {
                    propName = propNames[j];
                    if (!newObject.hasOwnProperty(propName)) {
                        newObject[propName] = mixins[i][propName];
                    }
                }
            }
        }
        if (this.mixins) {
            i = this.mixins.length;
            while (i--) {
                if (BitUtil.arrayIndexOf(newObject.mixins, this.mixins[i]) === -1) {
                    newObject.mixins.push(this.mixins[i]);
                }
            }
        }
        Object.defineProperties(newObject, descriptors);

        newObject._superClass = this;

        return newObject;
    },

    toString: function () {
        return '[ object ' + this.className + ' ' + this.instanceID + ' ]';
    },

    _construct: bit_noop,

    _constructMixin: function (mixin, args) {
        if (BitUtil.arrayIndexOf(this.mixins, mixin) !== -1) {
            mixin._construct.apply(this, args);
        }
    },

    _constructSuper: function (args) {
        return this._superClass._construct(this, args);
    },

    _super: function (method, args) {
        return this._superClass[method].apply(this, args);
    },

    _isValidPropertyType: function (property) {
        return property === null ||
               property === undefined ||
               BitUtil.arrayIndexOf(BitObject._validPropertyTypes, typeof property) !== -1;
    }
};

var BitObject = bit.core.BitObject;