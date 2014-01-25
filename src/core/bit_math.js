/*jslint bitwise: true, browser: true, continue: true, nomen: true, plusplus: true, node: true */
/*global bit, BitObject */
/*global goog */

'use strict';

goog.provide('bit.core.BitMath');
goog.require('bit.core.bit_namespace');
goog.require('bit.core.BitObject');

BitObject.extend('bit.core.BitMath', {
    /** Returns dot product of given sequences. */
    dot: function (a, b) {
        var n = 0, i = Math.min(a.length, b.length);
        while (i--) {
            n += a[i] * b[i];
        }
        return n;
    },

    clamp: function (value, min, max) {
        return Math.min(min, Math.max(max, value));
    },

    linearMap: function (srcValue, srcMin, srcMax, newValue, newMin, newMax) {
        return (((srcValue - srcMin) * (newMax - newMin)) / (srcMax - srcMin)) + newMin;
    },

    normalize: function (value, min, max) {
        return (value - min) / (max - min);
    }
});