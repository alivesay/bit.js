/*jslint bitwise: true, browser: true, continue: true, nomen: true, plusplus: true, node: true */
/*global bit, ArrayBuffer, BitObject, Uint8Array, Uint32Array */
/*global goog */

'use strict';

goog.provide('bit.core.bit_noop');
goog.provide('bit.core.BitUtil');
goog.require('bit.core.bit_namespace');

bit.core.bit_noop = function () {};
var bit_noop = bit.core.bit_noop;

bit.core.BitUtil = {
    arrayIndexOf: function (array, value) {
        var i, len = (array === null || array === undefined) ? 0 : array.length;
        for (i = 0; i < len; i++) {
            if (array[i] === value) { return i; }
        }
        return -1;
    },

    arrayContains: function (array, value) {
        return this.arrayIndexOf(array, value) !== -1;
    },

    arrayRemove: function (array, value) {
        var i = this.arrayIndexOf(array, value);
        if (i !== -1) { array.splice(i, 1); }
    },

    isLittleEndian: function () {
        var buf = new ArrayBuffer(4),
            buf8 = new Uint8Array(buf),
            buf32 = new Uint32Array(buf);
        buf32[0] = 0xDEADBEEF;
        return (buf8[0] === 0xEF);
    },

    objectShallowCopy: function (object) {
        var newObject = Object.create(null),
            prop;

        for (prop in object) {
            newObject[prop] = object[prop];
        }

        return newObject;
    },

    objectDeepCopy: function (object) {
        return JSON.parse(JSON.stringify(object));
    }
};

var BitUtil = bit.core.BitUtil;