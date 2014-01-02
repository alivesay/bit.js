/*jslint bitwise: true, browser: true, continue: true, nomen: true, plusplus: true, node: true */
/*global BitEntityManager, BitEventHandler, BitObject */
/*global goog */

'use strict';

goog.provide('bit.core.BitEntity');
goog.require('bit.core.BitEntityManager');
goog.require('bit.core.BitEventHandler');
goog.require('bit.core.BitObject');

var BitEntity = BitObject.extend({
    id: null,
    active: true,
    parent: null
}, null, [BitEventHandler, BitEntityManager]);