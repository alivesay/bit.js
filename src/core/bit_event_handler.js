/*jslint bitwise: true, browser: true, continue: true, nomen: true, plusplus: true, node: true */
/*global bit, BitObject */
/*global goog */

'use strict';

goog.provide('bit.core.BitEventHandler');
goog.require('bit.core.bit_namespace');
goog.require('bit.core.BitObject');

BitObject.extend('bit.core.BitEventHandler', {
    handleEvent: function (event) {
        throw new Error("BitEventHandler.handleEvent: No implementation for abstract method defined");
    }
});