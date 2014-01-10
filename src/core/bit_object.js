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
    instanceUUID: 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx',

    _superClass: null,
    _validPropertyTypes: ['function', 'string', 'number', 'boolean'],

    /**
     * Generates an RFC4122-compliant v4 UUID.
     * @returns {string}
     */
    generateUUID: function () {
        var timestamp = Date.now(), uuid = '', i = -1, c;

        while (i++ < 35) {
            c = this.instanceUUID.charAt(i);
            if (c === 'x') {
                uuid += ((timestamp + Math.random() * 16) & 15).toString(16);
            } else if (c === '-' || c === '4') {
                uuid += c;
            } else {
                uuid += (((Math.random() * 16 | 0) & 0x3) | 0x08).toString(16);
            }

            timestamp >>= 2;
        }

        return uuid;
    },

    create: function () {
        var newObject = Object.create(this);
        newObject.instanceUUID = this.generateUUID();
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
                if (!BitObject._isValidMixin(mixins[i])) {
                    throw new Error('BitObject.extend: Bad mixin [' + mixins[i].className + '] on [' + newObject.className + ']');
                }

                newObject.mixins.push(mixins[i]);
                if (mixins[i].mixins) {
                    j = mixins[i].mixins.length;
                    while (j--) {
                        if (!BitUtil.arrayContains(newObject.mixins, mixins[i].mixins[j])) {
                            newObject.mixins.push(mixins[i].mixins[j]);
                        }
                    }
                }
                propNames = Object.getOwnPropertyNames(mixins[i]);
                j = propNames.length;
                while (j--) {
                    propName = propNames[j];
                    if (!newObject.hasOwnProperty(propName) && mixins[i][propName] !== null && mixins[i][propName] !== undefined) {
                        newObject[propName] = mixins[i][propName];
                    }
                }
            }
        }
        if (this.mixins) {
            i = this.mixins.length;
            while (i--) {
                if (!BitUtil.arrayContains(newObject.mixins, this.mixins[i])) {
                    newObject.mixins.push(this.mixins[i]);
                }
            }
        }
        Object.defineProperties(newObject, descriptors);

        newObject._superClass = this;

        return newObject;
    },

    toString: function () {
        return '[ object ' + this.className + ' ' + this.instanceUUID + ' ]';
    },

    _construct: bit_noop,

    _constructSuper: function (superClass, args) {
        return this._super(superClass, '_construct', args);
    },

    _super: function (superClass, method, args) {
        return superClass[method].apply(this, args);
    },

    _isValidPropertyType: function (property) {
        return property === null ||
               property === undefined ||
               BitUtil.arrayContains(BitObject._validPropertyTypes, typeof property);
    },

    _isValidMixin: function (mixin) {
        return mixin._superClass.className === 'BitObject' && mixin._construct === bit_noop;
    }
};

var BitObject = bit.core.BitObject;

