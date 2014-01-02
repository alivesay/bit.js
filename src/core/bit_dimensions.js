/*jslint bitwise: true, browser: true, continue: true, nomen: true, plusplus: true, node: true */
/*global BitObject */
/*global goog */

'use strict';

goog.provide('bit.core.BitDimensions');
goog.require('bit.core.BitObject');

var BitDimensions = BitObject.extend({
    width: 0,
    height: 0,

    _construct: function (width, height) {
        this.width = width || this.width;
        this.height = height || this.height;
    }
});