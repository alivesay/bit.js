/*jslint bitwise: true, browser: true, continue: true, nomen: true, plusplus: true, node: true */
/*global BitObject */
/*global goog */

'use strict';

goog.provide('bit.core.BitEvent');
goog.require('bit.core.BitObject');

var BitEvent = BitObject.extend({
    name: null,
    type: 'BitEvent',
    notifier: null,

    _construct: function (name, notifier) {
        this.name = name;
        this.notifier = notifier || null;
    }
},  { qualifiedName: { get: function () { return this.type + '.' + (this.name || 'UNDEFINED'); } } });