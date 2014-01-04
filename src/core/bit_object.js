/*jslint bitwise: true, browser: true, continue: true, nomen: true, plusplus: true, node: true */
/*global bit_noop, BitUtil */
/*global goog */

'use strict';

goog.provide('bit.core.BitObject');
goog.require('bit.core.BitUtil');
goog.require('bit.core.bit_noop');

var BitObject = {
    mixins: null,
    className: 'BitObject',
    id: 0,

    generateID: function () {
        return ++BitObject.id;
    },

    create: function () {
        var newObject = Object.create(this);
        newObject.id = this.generateID();
        this._construct.apply(newObject, arguments);
        return newObject;
    },

    extend: function (name, props, descriptors, mixins) {
        var newObject = Object.create(this), propName, propNames, i, j;

        descriptors = descriptors || {};

        newObject.className = name;

        if (props) {
            propNames = Object.getOwnPropertyNames(props);
            i = propNames.length;
            while (i--) {
                propName = propNames[i];
                if (!descriptors.hasOwnProperty(propName)) {
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

        return newObject;
    },

    toString: function () {
        return '[ object ' + this.className + ' ' + this.id + ' ]';
    },

    _construct: bit_noop,

    _constructMixin: function (mixin, args) {
        if (BitUtil.arrayIndexOf(this.mixins, mixin) !== -1) {
            mixin._construct.apply(this, args);
        }
    },

    _super: function (obj, method, args) {
        return Object.getPrototypeOf(obj)[method].apply(this, args);
    }
};