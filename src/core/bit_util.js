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
    /** Returns first index of value in array or -1. */
    arrayIndexOf: function (array, value) {
        var i, len = array.length;
        for (i = 0; i < len; i++) {
            if (array[i] === value) { return i; }
        }
        return -1;
    },

    arrayContains: function (array, value) {
        return this.arrayIndexOf(array, value) !== -1;
    },

    /** Removes first occurrence of value in array if found. */
    arrayRemove: function (array, value) {
        var i = this.arrayIndexOf(array, value);
        if (i !== -1) { array.splice(i, 1); }
    },

    /** Returns true if little-endian architecture is detected. */
    isLittleEndian: function () {
        var buf = new ArrayBuffer(4),
            buf8 = new Uint8Array(buf),
            buf32 = new Uint32Array(buf);
        buf32[0] = 0xDEADBEEF;
        return (buf8[0] === 0xEF);
    }
};

var BitUtil = bit.core.BitUtil;