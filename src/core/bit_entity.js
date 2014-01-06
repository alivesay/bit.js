/*jslint bitwise: true, browser: true, continue: true, nomen: true, plusplus: true, node: true */
/*global bit, BitEntityManager, BitEventHandler, BitObject */
/*global goog */

'use strict';

goog.provide('bit.core.BitEntity');
goog.require('bit.core.bit_namespace');
goog.require('bit.core.BitEntityManager');
goog.require('bit.core.BitEventHandler');
goog.require('bit.core.BitObject');

BitObject.extend('bit.core.BitEntity', {
    id: null,
    parent: null,
    active: true,

    _construct: function (id) {
        this._constructMixin(BitEventHandler);
        this._constructMixin(BitEntityManager);

        this.id = id || this.id;
    }
}, null, [BitEventHandler, BitEntityManager]);