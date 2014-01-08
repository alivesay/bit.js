/*jslint bitwise: true, browser: true, continue: true, nomen: true, plusplus: true, node: true */
/*global bit, BitEntityContainerMixin, BitEventHandler, BitObject */
/*global goog */

'use strict';

goog.provide('bit.core.BitEntity');
goog.require('bit.core.bit_namespace');
goog.require('bit.core.BitEntityContainerMixin');
goog.require('bit.core.BitObject');

BitObject.extend('bit.core.BitEntity', {
    id: null,
    parent: null,
    active: true,

    _construct: function (id) {
        this.id = id || this.id;
    }
}, null, [BitEntityContainerMixin]);