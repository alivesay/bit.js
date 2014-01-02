/*jslint bitwise: true, browser: true, continue: true, nomen: true, plusplus: true, node: true */
/*global BitObject */
/*global goog */

'use strict';

goog.provide('bit.core.BitEventHandler');
goog.require('bit.core.BitObject');

var BitEventHandler = BitObject.extend({
    handleEvent: function (event) {
        throw new Error("BitEventHandler.handleEvent: No implementation for abstract method defined");
    }
});