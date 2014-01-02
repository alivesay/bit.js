/*jslint bitwise: true, browser: true, continue: true, nomen: true, plusplus: true, node: true */
/*global BitObject */
/*global goog */

'use strict';

goog.provide('bit.core.BitMath');
goog.require('bit.core.BitObject');

var BitMath = BitObject.extend({
    /** Returns dot product of given sequences. */
    dot: function (a, b) {
        var n = 0, i = Math.min(a.length, b.length);
        while (i--) {
            n += a[i] * b[i];
        }
        return n;
    }
});