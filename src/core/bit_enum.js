/*jslint bitwise: true, browser: true, continue: true, nomen: true, plusplus: true, node: true */
/*global BitObject */
/*global goog */

'use strict';

goog.provide('bit.core.BitEnum');
goog.require('bit.core.BitObject');

var BitEnum = BitObject.extend('BitEnum', {
    _construct: function (values) {
        var i = values.length;

        while (i--) {
            Object.defineProperty(this, values[i], {
                value: i | 0,
                enumerable: false,
                configurable: false,
                writable: false
            });
        }
    }
});