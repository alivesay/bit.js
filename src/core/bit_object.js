/*jslint bitwise: true, browser: true, continue: true, nomen: true, plusplus: true, node: true */
/*global bit_noop, BitUtil */
/*global goog */

'use strict';

goog.provide('bit.core.BitObject');
goog.require('bit.core.BitUtil');
goog.require('bit.core.bit_noop');

var BitObject = {
    mixins: null,

    /** Returns a new BitObject. */
    create: function () {
        var newObject = Object.create(this);
        this._construct.apply(newObject, arguments);
        return newObject;
    },

    /** Returns a new BitObject with new and overridden properties.
     *  Optional mixins array can be provided, with highest priority last.
     * */
    extend: function (props, descriptors, mixins) {
        var newObject = Object.create(this), name, propNames, i, j;

        descriptors = descriptors || {};
        if (props) {
            propNames = Object.getOwnPropertyNames(props);
            i = propNames.length;
            while (i--) {
                name = propNames[i];
                if (!descriptors.hasOwnProperty(name)) {
                    newObject[name] = props[name];
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
                    name = propNames[j];
                    if (!newObject.hasOwnProperty(name)) {
                        newObject[name] = mixins[i][name];
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